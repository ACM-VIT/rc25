'use server'

import { revalidatePath } from 'next/cache';
import { firestoreService } from '@/lib/firebase-admin-service';

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function clearFirestoreData(): Promise<ActionResponse> {
  try {
    await firestoreService.leaderboard.clearAllData();
    
    revalidatePath('/');
    
    return {
      success: true,
      message: 'All Firestore data has been cleared successfully'
    };
  } catch (error) {
    console.error('Failed to clear Firestore data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}