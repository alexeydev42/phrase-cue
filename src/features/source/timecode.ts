export const parseTimecode = (value: string): number | null => {
  const time = value.trim().split(':')
  if (time.length !== 2 && time.length !== 3) {
    return null
  }
  const isValid = time.every((part) => /^\d+$/.test(part))
  if (!isValid) {
    return null
  }
  const timeNumber = time.map(Number)
  if (timeNumber.length === 2) {
    const [minutes, seconds] = timeNumber
    if (seconds >= 0 && seconds <= 59) {
      const totalMs = minutes * 60 * 1000 + seconds * 1000
      return Number.isSafeInteger(totalMs) ? totalMs : null
    }
    return null
  } else {
    const [hours, minutes, seconds] = timeNumber
    if (seconds >= 0 && seconds <= 59 && minutes >= 0 && minutes <= 59) {
      const totalMs = hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000
      return Number.isSafeInteger(totalMs) ? totalMs : null
    }
    return null
  }
}

export const formatTimecode = (timeMs: number): string => {
  const totalSeconds = Math.floor(timeMs / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const hours = String(h).padStart(2, '0')
  const minutes = String(m).padStart(2, '0')
  const seconds = String(s).padStart(2, '0')

  if (h === 0) {
    return `${minutes}:${seconds}`
  }

  return `${hours}:${minutes}:${seconds}`
}
