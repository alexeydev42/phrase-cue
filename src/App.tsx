import { Routes, Route } from 'react-router';
import { EpisodePage } from './pages/EpisodePage/EpisodePage';
import { LibraryPage } from './pages/LibraryPage/LibraryPage';
import { StudyPage } from './pages/StudyPage/StudyPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { AppShell } from './layouts/AppShell/AppShell';
import { SelectPhrasePage } from './pages/SelectPhrasePage/SelectPhrasePage';

export const App = () => {
  return (
    <Routes>
      <Route path='/'>
        <Route element={<AppShell />}>
          <Route index element={<EpisodePage />} />
          <Route path='library' element={<LibraryPage />} />
          <Route path='study' element={<StudyPage />} />
          <Route path='settings' element={<SettingsPage />} />
        </Route>
        <Route path='episode/select/:cueId' element={<SelectPhrasePage />} />
      </Route>
    </Routes>
  );
};
