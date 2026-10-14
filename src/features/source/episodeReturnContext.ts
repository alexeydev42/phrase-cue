import { createContext, useContext } from 'react'

export interface EpisodeReturnState {
  episodeId: string
  timecodeInput: string
  targetMs: number | null
  beforeCount: number
  afterCount: number
  listScrollTop: number
  pageScrollY: number
}

export interface EpisodeReturnContextValue {
  snapshot: EpisodeReturnState | null
  remember: (state: EpisodeReturnState) => void
  clear: () => void
}

export const EpisodeReturnContext = createContext<EpisodeReturnContextValue | null>(null)

export const useEpisodeReturn = (): EpisodeReturnContextValue => {
  const context = useContext(EpisodeReturnContext)

  if (!context) {
    throw new Error('useEpisodeReturn must be used inside EpisodeReturnProvider')
  }

  return context
}
