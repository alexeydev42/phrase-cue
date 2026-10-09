import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { App } from './App'
import { loadActiveEpisodeId, loadShows, saveActiveEpisodeId, subscribeToActiveEpisodePersistence, subscribeToShowsPersistence } from './features/source/sourceStorage'
import { hydrateShows, setActiveEpisodeId } from './features/source/sourceSlice'
import './styles/global.css'

const startApp = async () => {
  const shows = await loadShows()
  store.dispatch(hydrateShows(shows))

  const activeEpisodeId = loadActiveEpisodeId()
  const activeEpisodeIdExists = shows.some((show) =>
    show.seasons.some((season) =>
      season.episodes.some((episode) => episode.id === activeEpisodeId)
    )
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