export const detectEpisodeNumber = (filename: string): number | null => {
  const match = filename.trim().match(/s\d+e(\d+)/i)

  if (!match) {
    return null
  }

  const episodeNumber = Number(match[1])
  return episodeNumber > 0 ? episodeNumber : null
}
