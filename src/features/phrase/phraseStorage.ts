import { dbPromise } from '../../app/db'
import type { Phrase } from './phraseTypes'

export const savePhrases = async (phrases: Phrase[]) => {
  const db = await dbPromise
  await db.put('phrases', phrases, 'items')
}

export const loadPhrases = async (): Promise<Phrase[]> => {
  const db = await dbPromise
  const phrases = await db.get('phrases', 'items')

  return phrases ?? []
}
