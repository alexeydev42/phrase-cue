import { openDB, type DBSchema } from 'idb'
import type { Show } from '../features/source/sourceTypes'
import type { Phrase } from '../features/phrase/phraseTypes'

export interface PhraseCueDB extends DBSchema {
  source: {
    key: 'shows'
    value: Show[]
  }
  phrases: {
    key: 'items'
    value: Phrase[]
  }
  settings: {
    key: 'learningLimit'
    value: number
  }
}

export const dbPromise = openDB<PhraseCueDB>('phrase-cue', 3, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('source')) {
      db.createObjectStore('source')
    }

    if (!db.objectStoreNames.contains('phrases')) {
      db.createObjectStore('phrases')
    }

    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings')
    }
  },
})
