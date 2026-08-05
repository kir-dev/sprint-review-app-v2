import { getPrismaLogLevels } from '../../../prisma/prisma.service';

describe('Prisma logging', () => {
  it('disables query and engine logging in production', () => {
    expect(getPrismaLogLevels('production')).toEqual([]);
  });

  it('keeps development diagnostics outside production', () => {
    expect(getPrismaLogLevels('development')).toContain('query');
  });
});
