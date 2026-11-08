/** Durée lisible d'un audio : « 4 s », « 26 min », « 1 h 05 min ». */
export const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)} s`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`
}

/** Durée ISO 8601 (`PT26M`) pour l'attribut `datetime` de `<time>`. */
export const isoDuration = (seconds: number) => `PT${Math.round(seconds)}S`
