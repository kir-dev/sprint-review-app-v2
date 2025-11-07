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

export const positionColors: Record<Position, string> = {
  UJONC: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  TAG: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  HR_FELELOS: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  PR_FELELOS: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  TANFOLYAMFELELOS: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  GAZDASAGIS: "bg-green-500/10 text-green-500 border-green-500/20",
  KORVEZETO_HELYETTES: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  KORVEZETO: "bg-red-500/10 text-red-500 border-red-500/20",
  OREGTAG: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  ARCHIVALT: "bg-gray-400/10 text-gray-400 border-gray-400/20",
}
