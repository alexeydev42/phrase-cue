import { openDB, type DBSchema } from 'idb'
import type { Show } from './sourceTypes'
import type { AppStore } from '../../app/store'
import { selectActiveEpisodeId, selectShows } from './sourceSlice'

interface PhraseCueDB extends DBSchema {
  source: {
    key: 'shows'
    value: Show[]
  }
}

const dbPromise = openDB<PhraseCueDB>('phrase-cue', 1, {
  upgrade(db) {
    db.createObjectStore('source')
  }
})

export const saveShows = async (shows: Show[]) => {
  const db = await dbPromise
  await db.put('source', shows, 'shows')
}

export const loadShows = async (): Promise<Show[]> => {
  const db = await dbPromise
  const shows = await db.get('source', 'shows')

  return shows ?? []
}

export const subscribeToShowsPersistence = (store: AppStore) => {
  let previousShows = selectShows(store.getState())

  return store.subscribe(async () => {
    const currentShows = selectShows(store.getState())

    if (currentShows === previousShows) {
      return
    }

    previousShows = currentShows
    await saveShows(currentShows)
  })
}

const ACTIVE_EPISODE_ID_KEY = 'phrase-cue-active-episode-id'

export const loadActiveEpisodeId = (): string | null => {
  return localStorage.getItem(ACTIVE_EPISODE_ID_KEY)
}

export const saveActiveEpisodeId = (episodeId: string | null) => {
  if (episodeId === null) {
    localStorage.removeItem(ACTIVE_EPISODE_ID_KEY)
    return
  }

  localStorage.setItem(ACTIVE_EPISODE_ID_KEY, episodeId)
}

export const subscribeToActiveEpisodePersistence = (store: AppStore) => {
  let previousActiveEpisodeId = selectActiveEpisodeId(store.getState())

  return store.subscribe(() => {
    const currentActiveEpisodeId = selectActiveEpisodeId(store.getState())

    if (currentActiveEpisodeId === previousActiveEpisodeId) {
      return
    }

    previousActiveEpisodeId = currentActiveEpisodeId
    saveActiveEpisodeId(currentActiveEpisodeId)
  })
}