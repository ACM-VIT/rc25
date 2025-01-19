import { CockroachService } from '@/lib/cockroach-service';

async function setupChangefeed() {
  const cockroachService = new CockroachService();

  try {
    await cockroachService.setupChangefeed();
    console.log('Changefeed setup completed');
  } catch (error) {
    console.log('Failed to setup changefeed:', error);
  } finally {
    await cockroachService.disconnect();
  }
}

setupChangefeed();