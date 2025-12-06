import { Position } from "../../app/logs/types"

export const positionLabels: Record<Position, string> = {
  [Position.UJONC]: "Újonc",
  [Position.TAG]: "Tag",
  [Position.HR_FELELOS]: "HR-felelős",
  [Position.PR_FELELOS]: "PR-felelős",
  [Position.TANFOLYAMFELELOS]: "Tanfolyamfelelős",
  [Position.GAZDASAGIS]: "Gazdaságis",
  [Position.KORVEZETO_HELYETTES]: "Körvezető helyettes",
  [Position.KORVEZETO]: "Körvezető",
  [Position.OREGTAG]: "Öregtag",
  [Position.ARCHIVALT]: "Archivált",
}

export const positionSortOrder: Position[] = [
  Position.KORVEZETO,
  Position.KORVEZETO_HELYETTES,
  Position.GAZDASAGIS,
  Position.TANFOLYAMFELELOS,
  Position.PR_FELELOS,
  Position.HR_FELELOS,
  Position.TAG,
  Position.UJONC,
  Position.OREGTAG,
  Position.ARCHIVALT,
]

export const positionColors: Record<Position, string> = {
  [Position.UJONC]: "bg-slate-500/10 text-foreground border-slate-500/20",
  [Position.TAG]: "bg-orange-500/10 text-foreground border-orange-500/20",
  [Position.HR_FELELOS]: "bg-pink-500/10 text-foreground border-pink-500/20",
  [Position.PR_FELELOS]: "bg-purple-500/10 text-foreground border-purple-500/20",
  [Position.TANFOLYAMFELELOS]: "bg-indigo-500/10 text-foreground border-indigo-500/20",
  [Position.GAZDASAGIS]: "bg-emerald-500/10 text-foreground border-emerald-500/20",
  [Position.KORVEZETO_HELYETTES]: "bg-amber-500/10 text-foreground border-amber-500/20",
  [Position.KORVEZETO]: "bg-red-500/10 text-foreground border-red-500/20",
  [Position.OREGTAG]: "bg-yellow-500/10 text-foreground border-yellow-500/20",
  [Position.ARCHIVALT]: "bg-gray-400/10 text-foreground border-gray-400/20",
}
