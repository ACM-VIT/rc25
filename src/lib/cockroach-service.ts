import { PrismaClient } from '@prisma/client';

export class CockroachService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async setupChangefeed(): Promise<void> {
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
      const query = `
        CREATE CHANGEFEED INTO 'webhook-${webhookUrl}/api/changefeed'
        WITH updated, resolved='10s'
        AS SELECT id, name, score
        FROM "Team";
      `;

      const result = await this.prisma.$executeRawUnsafe(query);
      console.log(result)
      console.log('Changefeed setup completed successfully');
    } catch (error) {
      console.error('Error setting up changefeed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}