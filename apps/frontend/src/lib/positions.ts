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
  UJONC: "bg-slate-500/10 text-slate-900 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-100 dark:border-slate-500/40",
  TAG: "bg-orange-500/10 text-orange-900 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-100 dark:border-orange-500/40",
  HR_FELELOS: "bg-pink-500/10 text-pink-900 border-pink-500/20 dark:bg-pink-500/20 dark:text-pink-100 dark:border-pink-500/40",
  PR_FELELOS: "bg-purple-500/10 text-purple-900 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-100 dark:border-purple-500/40",
  TANFOLYAMFELELOS: "bg-indigo-500/10 text-indigo-900 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-100 dark:border-indigo-500/40",
  GAZDASAGIS: "bg-emerald-500/10 text-emerald-900 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-100 dark:border-emerald-500/40",
  KORVEZETO_HELYETTES: "bg-amber-500/10 text-amber-900 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-500/40",
  KORVEZETO: "bg-red-500/10 text-red-900 border-red-500/20 dark:bg-red-500/20 dark:text-red-100 dark:border-red-500/40",
  OREGTAG: "bg-yellow-500/10 text-yellow-900 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-100 dark:border-yellow-500/40",
  ARCHIVALT: "bg-gray-400/10 text-gray-800 border-gray-400/20 dark:bg-gray-500/20 dark:text-gray-100 dark:border-gray-500/40",
}
