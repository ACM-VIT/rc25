import { type NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firebase-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payloadArray = Array.isArray(body.payload) ? body.payload : [body];

    for (const change of payloadArray) {
      if (change.__crdb__?.resolved) {
        continue;
      }

      if (change.id && change.name && change.score) {
        if (change.id == process.env.ADMIN_TEAM_ID) {
          continue;
        }
        await firestoreService.updateTeam({id: change.id, name: change.name, score: change.score});
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.log('Error processing changefeed:', error);
    return NextResponse.json(
      { error: 'Failed to process changefeed' },
      { status: 500 }
    );
  }
}