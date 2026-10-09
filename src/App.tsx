import { Routes, Route } from 'react-router'
import { EpisodePage } from './pages/EpisodePage/EpisodePage'
import { LibraryPage } from './pages/LibraryPage/LibraryPage'
import { StudyPage } from './pages/StudyPage/StudyPage'
import { SettingsPage } from './pages/SettingsPage/SettingsPage'
import { AppShell } from './layouts/AppShell/AppShell'
import { SelectPhrasePage } from './pages/SelectPhrasePage/SelectPhrasePage'
import { ThemeSync } from './features/settings/ThemeSync'
import { SourceShell } from './layouts/SourceShell/SourceShell'
import { ShowsPage } from './pages/ShowsPage/ShowsPage'
import { AddShowPage } from './pages/AddShowPage/AddShowPage'
import { ShowPage } from './pages/ShowPage/ShowPage'
import { AddSeasonPage } from './pages/AddSeasonPage/AddSeasonPage'

export const App = () => {
  return (
    <>
      <ThemeSync />
      <Routes>
        <Route path='/'>
          <Route element={<AppShell />}>
            <Route index element={<EpisodePage />} />
            <Route path='library' element={<LibraryPage />} />
            <Route path='study' element={<StudyPage />} />
            <Route path='settings' element={<SettingsPage />} />
          </Route>
          <Route path='episode/select/:cueId' element={<SelectPhrasePage />} />
          <Route element={<SourceShell />}>
            <Route path='episode/shows' element={<ShowsPage />} />
            <Route path='episode/shows/new' element={<AddShowPage />} />
            <Route path='episode/shows/:showId' element={<ShowPage />} />
            <Route
              path='episode/shows/:showId/seasons/new'
              element={<AddSeasonPage />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  )
}
