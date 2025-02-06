import {initializeApp, getApps, cert} from 'firebase-admin/app';
import {
    getFirestore
} from 'firebase-admin/firestore';

// import type { LeaderboardTeam } from '@/types/leaderboard';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};
// Initialize Firebase
const creds = process.env.GCP_CREDENTIALS;
if (!creds) {
    throw new Error('GCP_CREDENTIALS not found');
}

const app = getApps().length === 0 ? initializeApp({
    credential: cert(JSON.parse(creds)), ...firebaseConfig
}) : getApps()[0];
const db = getFirestore(app);

async function deleteQueryBatch(
    collectionRef: string,
    batchSize: number = 100
): Promise<void> {
    try {
        const batch = db.batch();

        const q = db.collection(collectionRef)
            .limit(batchSize);

        const snapshot = await q.get();

        if (snapshot.size === 0) {
            return;
        }

        snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
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
    leaderboard:
        {
            async updateTeam({id, name, score}:
                                 {
                                     id: string;
                                     name: string;
                                     score: number
                                 }
            ) {
                const teamRef = db.collection('leaderboard').doc(id);
                await teamRef.set({name, score}, {merge: true});
            }
            ,

            async clearCollection(collectionPath
                                      :
                                      string
            ):
                Promise<void> {
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

                    for (const collectionPath of collections
                        ) {
                        await this.clearCollection(collectionPath);
                    }

                    console.log('Successfully cleared all collections');
                } catch
                    (error) {
                    console.error('Error clearing all data:', error);
                    throw new Error(`Failed to clear all data: ${(error as Error).message}`);
                }
            }
        },
    submissions: {
        async created(id: string) {
            const submissionRef = db.collection('submissions').doc(id);
            await submissionRef.set({status: false}, {merge: true});
        },
        async processed(id: string) {
            const submissionRef = db.collection('submissions').doc(id);
            await submissionRef.set({status: true}, {merge: true});
        }
    }
};
