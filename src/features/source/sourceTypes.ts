
export interface Show {
  id: string
  title: string
  seasons: Season[]
}

export interface Season {
  id: string
  number: number
  episodes: Episode[]
}

export interface Episode {
  id: string
  number: number
  cues: Cue[]
}

export interface Cue {
  id: string
  startMs: number
  endMs: number
  text: string
}

export interface SourceState {
  shows: Show[]
  activeEpisodeId: string | null
}

export interface PhraseSourceSnapshot {
  showTitle: string
  seasonNumber: number
  episodeNumber: number
  timecodeMs: number
}