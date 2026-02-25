// lib/firebase-admin-service.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const creds = process.env.GCP_CREDENTIALS;
if (!creds) {
  throw new Error('GCP_CREDENTIALS not found');
}

const parseServiceAccount = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch (_) {
    const sanitized = raw.replace(
      /"private_key"\s*:\s*"([\s\S]*?)"/,
      (_match, key) => `"private_key":"${key.replace(/\r?\n/g, "\\n")}"`
    );
    if (sanitized !== raw) {
      try {
        return JSON.parse(sanitized);
      } catch (_) {
        // fall through
      }
    }
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (_) {
      throw new Error(
        "GCP_CREDENTIALS must be valid JSON (escape newlines in private_key) or base64-encoded JSON."
      );
    }
  }
};

const serviceAccount = parseServiceAccount(creds);
if (typeof serviceAccount.private_key === "string") {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

const app = getApps().length === 0
  ? initializeApp({ credential: cert(serviceAccount), ...firebaseConfig })
  : getApps()[0];

const db = getFirestore(app);

async function deleteQueryBatch(collectionRef: string, batchSize: number = 100): Promise<void> {
  try {
    const batch = db.batch();
    const q = db.collection(collectionRef).limit(batchSize);
    const snapshot = await q.get();

    if (snapshot.size === 0) {
      return;
    }

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    await new Promise<void>((resolve) => {
      process.nextTick(async () => {
        await deleteQueryBatch(collectionRef, batchSize);
        resolve();
      });
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    throw error;
  }
}

export const firestoreService = {
  leaderboard: {
    async updateTeam({ id, name, score }: { id: string; name: string; score: number }) {
      const teamRef = db.collection('leaderboard').doc(id);
      await teamRef.set({ name, score }, { merge: true });
    },

    async clearCollection(collectionPath: string): Promise<void> {
      try {
        console.log(`Starting deletion of collection: ${collectionPath}`);
        const batchSize = 100;
        await deleteQueryBatch(collectionPath, batchSize);
        console.log(`Successfully cleared collection: ${collectionPath}`);
      } catch (error) {
        console.error('Error clearing collection:', error);
        throw new Error(`Failed to clear collection: ${(error as Error).message}`);
      }
    },

    async clearAllData(): Promise<void> {
      try {
        const collections = ['leaderboard'];
        for (const collectionPath of collections) {
          await this.clearCollection(collectionPath);
        }
        console.log('Successfully cleared all collections');
      } catch (error) {
        console.error('Error clearing all data:', error);
        throw new Error(`Failed to clear all data: ${(error as Error).message}`);
      }
    },

    async captureSnapshot(): Promise<void> {
      const snapshot = await db.collection('leaderboard')
        .orderBy('score', 'desc')
        .limit(8)
        .get();

      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const timestamp = new Date();
      await db.collection('leaderboardHistory').add({
        time: timestamp.toISOString(),
        teams,
        createdAt: timestamp,
      });

      console.log('Leaderboard snapshot captured at', timestamp.toISOString());
    }
  },

  submissions: {
    async created(id: string) {
      const submissionRef = db.collection('submissions').doc(id);
      await submissionRef.set({ status: false }, { merge: true });
    },
    async processed(id: string) {
      const submissionRef = db.collection('submissions').doc(id);
      await submissionRef.set({ status: true }, { merge: true });
    }
  }
};

export default db;
