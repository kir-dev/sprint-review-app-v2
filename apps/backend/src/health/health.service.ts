import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const READINESS_DEADLINE_MS = 1000;
const POSTGRES_STATEMENT_TIMEOUT_MS = 750;

@Injectable()
export class HealthService implements BeforeApplicationShutdown {
  private acceptingTraffic = true;

  constructor(private readonly prisma: PrismaService) {}

  isLive(): boolean {
    return true;
  }

  async isReady(): Promise<boolean> {
    if (!this.acceptingTraffic) {
      return false;
    }

    try {
      await this.prisma.$transaction(
        async (transaction) => {
          await transaction.$executeRawUnsafe(
            `SET LOCAL statement_timeout = ${POSTGRES_STATEMENT_TIMEOUT_MS}`,
          );
          await transaction.$queryRaw`SELECT 1`;
        },
        {
          maxWait: READINESS_DEADLINE_MS,
          timeout: READINESS_DEADLINE_MS,
        },
      );
      return true;
    } catch {
      return false;
    }
  }

  beforeApplicationShutdown(): void {
    this.acceptingTraffic = false;
  }
}

export { POSTGRES_STATEMENT_TIMEOUT_MS, READINESS_DEADLINE_MS };
