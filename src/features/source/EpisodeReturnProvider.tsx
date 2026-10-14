import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { EpisodeReturnContext, type EpisodeReturnState } from './episodeReturnContext'

interface EpisodeReturnProviderProps {
  children: ReactNode
}

export const EpisodeReturnProvider = ({ children }: EpisodeReturnProviderProps) => {
  const [snapshot, setSnapshot] = useState<EpisodeReturnState | null>(null)

  const remember = useCallback((state: EpisodeReturnState) => {
    setSnapshot(state)
  }, [])

  const clear = useCallback(() => {
    setSnapshot(null)
  }, [])

  const value = useMemo(() => ({ snapshot, remember, clear }), [snapshot, remember, clear])

  return <EpisodeReturnContext.Provider value={value}>{children}</EpisodeReturnContext.Provider>
}
