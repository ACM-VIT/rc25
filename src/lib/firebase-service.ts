import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { LeaderboardTeam } from '@/types/leaderboard';

export class FirestoreService {
  private static COLLECTION_NAME = 'leaderboard';

  static async updateTeam(team: LeaderboardTeam): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, team.id);
      await setDoc(docRef, {
        ...team,
      });
      console.log(`Updated team ${team.id} in Firestore`);
    } catch (error) {
      console.error(`Error updating team ${team.id}:`, error);
      throw error;
    }
  }
}
