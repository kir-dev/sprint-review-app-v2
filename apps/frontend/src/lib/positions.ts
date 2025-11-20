import { Position } from "../../app/logs/types"

export const positionLabels: Record<Position, string> = {
  UJONC: "Újonc",
  TAG: "Tag",
  HR_FELELOS: "HR-felelős",
  PR_FELELOS: "PR-felelős",
  TANFOLYAMFELELOS: "Tanfolyamfelelős",
  GAZDASAGIS: "Gazdaságis",
  KORVEZETO_HELYETTES: "Körvezető helyettes",
  KORVEZETO: "Körvezető",
  OREGTAG: "Öregtag",
  ARCHIVALT: "Archivált",
}

export const positionSortOrder: Position[] = [
  "KORVEZETO",
  "KORVEZETO_HELYETTES",
  "GAZDASAGIS",
  "TANFOLYAMFELELOS",
  "PR_FELELOS",
  "HR_FELELOS",
  "TAG",
  "UJONC",
  "OREGTAG",
  "ARCHIVALT",
]

export const positionColors: Record<Position, string> = {
  UJONC: "bg-slate-500/10 text-foreground border-slate-500/20",
  TAG: "bg-orange-500/10 text-foreground border-orange-500/20",
  HR_FELELOS: "bg-pink-500/10 text-foreground border-pink-500/20",
  PR_FELELOS: "bg-purple-500/10 text-foreground border-purple-500/20",
  TANFOLYAMFELELOS: "bg-indigo-500/10 text-foreground border-indigo-500/20",
  GAZDASAGIS: "bg-emerald-500/10 text-foreground border-emerald-500/20",
  KORVEZETO_HELYETTES: "bg-amber-500/10 text-foreground border-amber-500/20",
  KORVEZETO: "bg-red-500/10 text-foreground border-red-500/20",
  OREGTAG: "bg-yellow-500/10 text-foreground border-yellow-500/20",
  ARCHIVALT: "bg-gray-400/10 text-foreground border-gray-400/20",
}
