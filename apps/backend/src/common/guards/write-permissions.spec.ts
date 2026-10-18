import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { EventController } from '../../events/events.controller';
import { ProjectController } from '../../projects/projects.controller';
import { UsersController } from '../../users/users.controller';
import { WorkPeriodsController } from '../../work-periods/work-periods.controller';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

type Handler = (...args: unknown[]) => unknown;

/** Write endpoints and the permission each one must require. */
const guardedWrites: [string, object, string, string][] = [
  ['POST /users', UsersController, 'create', 'canManageSettings'],
  ['DELETE /users/:id', UsersController, 'remove', 'canManageSettings'],
  ['POST /events', EventController, 'create', 'canManageEvents'],
  ['PATCH /events/:id', EventController, 'update', 'canManageEvents'],
  ['DELETE /events/:id', EventController, 'remove', 'canManageEvents'],
  ['POST /projects', ProjectController, 'create', 'canManageProjects'],
  ['PATCH /projects/:id', ProjectController, 'update', 'canManageProjects'],
  ['DELETE /projects/:id', ProjectController, 'remove', 'canManageProjects'],
  ['POST /work-periods', WorkPeriodsController, 'create', 'canManageProjects'],
  [
    'PATCH /work-periods/:id',
    WorkPeriodsController,
    'update',
    'canManageProjects',
  ],
  [
    'DELETE /work-periods/:id',
    WorkPeriodsController,
    'remove',
    'canManageProjects',
  ],
];

/** Writes that stay open to every member; PATCH /users/:id checks in the service. */
const openWrites = new Set([
  'UsersController.update',
  'ProjectController.createFeature',
]);

const WRITE_METHODS = new Set([
  RequestMethod.POST,
  RequestMethod.PATCH,
  RequestMethod.PUT,
  RequestMethod.DELETE,
]);

function handlerOf(controller: object, name: string): Handler {
  return (controller as { prototype: Record<string, Handler> }).prototype[name];
}

describe('write endpoint permissions', () => {
  it.each(guardedWrites)(
    '%s requires the matching permission',
    (_route, controller, name, permission) => {
      const handler = handlerOf(controller, name);
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toContain(
        RolesGuard,
      );
      expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual([permission]);
    },
  );

  it('has no unreviewed write endpoint on the hardened controllers', () => {
    const controllers = [
      UsersController,
      EventController,
      ProjectController,
      WorkPeriodsController,
    ];
    const guardedNames = new Set(
      guardedWrites.map(
        ([, controller, name]) => `${(controller as Handler).name}.${name}`,
      ),
    );

    for (const controller of controllers) {
      for (const name of Object.getOwnPropertyNames(controller.prototype)) {
        const method = Reflect.getMetadata(
          METHOD_METADATA,
          handlerOf(controller, name),
        );
        if (!WRITE_METHODS.has(method)) continue;
        const key = `${controller.name}.${name}`;
        expect([key, guardedNames.has(key) || openWrites.has(key)]).toEqual([
          key,
          true,
        ]);
      }
    }
  });
});
