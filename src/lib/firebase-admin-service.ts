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

function parseServiceAccount(raw: string) {
  const candidates: string[] = [];
  const trimmed = raw.trim();
  candidates.push(raw, trimmed);

  if (!trimmed.startsWith('{')) {
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) {
        candidates.push(decoded);
      }
    } catch {
      // ignore base64 decode errors
    }
  }

  const escapePrivateKeyNewlines = (json: string) =>
    json.replace(/"private_key"\s*:\s*"([\s\S]*?)"/, (_match, key) => {
      const escaped = String(key).replace(/\r?\n/g, '\\n');
      return `"private_key":"${escaped}"`;
    });

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
      try {
        return JSON.parse(escapePrivateKeyNewlines(candidate));
      } catch (innerError) {
        lastError = innerError;
      }
    }
  }

  throw new Error(
    `Failed to parse GCP_CREDENTIALS. Ensure it is valid JSON or base64-encoded JSON. Original error: ${(lastError as Error).message}`
  );
}

const app = getApps().length === 0
  ? initializeApp({ credential: cert(parseServiceAccount(creds)), ...firebaseConfig })
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
      await submissionRef.set({ processed: false, updatedAt: Date.now() }, { merge: true });
    },
    async processed(id: string) {
      const submissionRef = db.collection('submissions').doc(id);
      await submissionRef.set({ processed: true, updatedAt: Date.now() }, { merge: true });
    }
  }
};

export default db;
