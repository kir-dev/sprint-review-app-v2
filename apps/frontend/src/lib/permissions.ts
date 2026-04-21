import { Position } from '../../app/logs/types';

export const EXPORT_LOGS_ROLES: readonly Position[] = [
  Position.KORVEZETO,
  Position.KORVEZETO_HELYETTES,
  Position.GAZDASAGIS,
];

export function canExportLogs(position: Position | undefined | null): boolean {
  return !!position && EXPORT_LOGS_ROLES.includes(position);
}
