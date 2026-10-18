import type { PhraseSourceSnapshot } from '../source/sourceTypes'

export type PhraseStatus = 'new' | 'learning' | 'learned'

export interface Phrase {
  id: string
  englishText: string
  russianText?: string
  status: PhraseStatus
  createdAt: string
  statusChangedAt: string
  source: PhraseSourceSnapshot
}
