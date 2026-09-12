import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { GROUP_ACCESS_KEY, parseConfiguredGroupId, parseSettings } from './group-access.types';

/** Initializes or repairs an installation policy; replacement requires an explicit flag. */
export async function configureGroupAccess(
  args: string[],
  configuredGroupId: unknown = process.env.AUTHSCH_GROUP_ID,
) {
  const groupId = parseConfiguredGroupId(configuredGroupId);
  const { values } = parseArgs({
    args,
    options: {
      'group-name': { type: 'string' },
      'allow-alumni': { type: 'boolean', default: false },
      replace: { type: 'boolean', default: false },
      show: { type: 'boolean', default: false },
    },
  });
  const policy = values.show
    ? null
    : parseSettings({
        groupName: values['group-name'],
        allowAlumni: values['allow-alumni'],
        version: randomUUID(),
        revision: randomUUID(),
      });
  const prisma = new PrismaClient();
  try {
    const current = await prisma.systemSetting.findUnique({ where: { key: GROUP_ACCESS_KEY } });
    if (values.show) {
      console.log(
        current
          ? JSON.stringify({ ...parseSettings(JSON.parse(current.value)), groupId })
          : `Group access settings are not initialized (deployment group: ${groupId}).`,
      );
      return;
    }
    if (current && !values.replace)
      throw new Error('Policy exists. Use --replace to reset access for all sessions.');
    const value = JSON.stringify(policy);
    if (current) {
      const result = await prisma.systemSetting.updateMany({
        where: { key: GROUP_ACCESS_KEY, value: current.value },
        data: { value },
      });
      if (result.count !== 1) throw new Error('Policy changed concurrently. Read it and retry.');
    } else {
      await prisma.systemSetting.create({ data: { key: GROUP_ACCESS_KEY, value } });
    }
    console.log(
      `Group access configured for PÉK group ${groupId}. Existing sessions must sign in again.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void configureGroupAccess(process.argv.slice(2)).catch(() => {
    console.error(
      'Configuration failed. Check AUTHSCH_GROUP_ID, arguments, database availability, and whether --replace is required.',
    );
    process.exitCode = 1;
  });
}
