import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type PrismaLogLevel = 'query' | 'info' | 'warn' | 'error';

export function getPrismaLogLevels(
  nodeEnv: string | undefined,
): PrismaLogLevel[] {
  return nodeEnv === 'production' ? [] : ['query', 'info', 'warn', 'error'];
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: getPrismaLogLevels(process.env.NODE_ENV),
    });
  }

  async onApplicationShutdown() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
