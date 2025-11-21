import { Difficulty, LogCategory, Position } from "./types"

export const DESCRIPTION_MIN_LENGTH = 10;
export const DESCRIPTION_MAX_LENGTH = 500;

export const validationMessages = {
  required: (field: string) => `${field} megadása kötelező`,
  dateInFuture: "A dátum nem lehet jövőbeli",
  descriptionMinLength: `A leírás legalább ${DESCRIPTION_MIN_LENGTH} karakter hosszú legyen`,
  descriptionMaxLength: `A leírás maximum ${DESCRIPTION_MAX_LENGTH} karakter hosszú lehet`,
  timeSpentNaN: "Az óraszám csak szám lehet",
  timeSpentNegative: "Az óraszám nem lehet negatív",
  timeSpentTooHigh: "Az óraszám nem lehet több mint 24",
  noWorkPeriod: "Ehhez a dátumhoz nem található work period",
};


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

export const categoryColors: Record<LogCategory, string> = {
  RESPONSIBILITY: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  PROJECT: "bg-primary/10 text-primary border-primary/20",
  EVENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  MAINTENANCE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  SIMONYI: "bg-green-500/10 text-green-500 border-green-500/20",
  OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}
