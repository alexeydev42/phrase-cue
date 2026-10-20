import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { App } from './App'
import {
  loadActiveEpisodeId,
  loadShows,
  saveActiveEpisodeId,
  subscribeToActiveEpisodePersistence,
  subscribeToShowsPersistence,
} from './features/source/sourceStorage'
import { loadPhrases } from './features/phrase/phraseStorage'
import { hydrateShows, setActiveEpisodeId } from './features/source/sourceSlice'
import { hydratePhrases } from './features/phrase/phraseSlice'
import { hydrateLearningLimit } from './features/settings/settingsThunks'
import './styles/global.css'

const startApp = async () => {
  const shows = await loadShows()
  store.dispatch(hydrateShows(shows))
  const phrases = await loadPhrases()
  store.dispatch(hydratePhrases(phrases))

  await store.dispatch(hydrateLearningLimit())

  const activeEpisodeId = loadActiveEpisodeId()
  const activeEpisodeIdExists = shows.some((show) =>
    show.seasons.some((season) =>
      season.episodes.some((episode) => episode.id === activeEpisodeId),
    ),
  )

  if (activeEpisodeId && activeEpisodeIdExists) {
    store.dispatch(setActiveEpisodeId(activeEpisodeId))
  } else {
    store.dispatch(setActiveEpisodeId(null))
    if (activeEpisodeId) {
      saveActiveEpisodeId(null)
    }
  }

  subscribeToShowsPersistence(store)
  subscribeToActiveEpisodePersistence(store)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>
    </StrictMode>,
  )
}

startApp()
