import { Difficulty, LogCategory } from "./types"

export const categoryLabels: Record<LogCategory, string> = {
  RESPONSIBILITY: "Felelősség",
  PROJECT: "Projekt",
  EVENT: "Rendezvény",
  MAINTENANCE: "Üzemeltetés",
  SIMONYI: "Simonyi",
  OTHER: "Egyéb",
}

export const difficultyLabels: Record<Difficulty, string> = {
  SMALL: "Kicsi",
  MEDIUM: "Közepes",
  LARGE: "Nagy",
}

export const categoryColors: Record<LogCategory, string> = {
  RESPONSIBILITY: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  PROJECT: "bg-primary/10 text-primary border-primary/20",
  EVENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  MAINTENANCE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  SIMONYI: "bg-green-500/10 text-green-500 border-green-500/20",
  OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}
