import type { AppDispatch, RootState } from '../../app/store'
import { enqueueDataOperation } from '../../app/dataOperationQueue'
import { hydratePhrases, selectPhrases } from '../phrase/phraseSlice'
import { selectLearningLimit, setLearningLimit } from '../settings/settingsSlice'
import { hydrateShows, selectShows, setActiveEpisodeId } from '../source/sourceSlice'
import { createBackup, type PhraseCueBackup } from './backup'
import { replaceBackupData } from './backupStorage'

export const restoreBackup = (backup: PhraseCueBackup) => {
  return (dispatch: AppDispatch) => {
    return enqueueDataOperation(async () => {
      await replaceBackupData(backup)

      dispatch(hydrateShows(backup.shows))
      dispatch(setActiveEpisodeId(null))
      dispatch(hydratePhrases(backup.phrases))
      dispatch(setLearningLimit(backup.settings.learningLimit))
    })
  }
}

export const exportBackup = () => {
  return (_dispatch: AppDispatch, getState: () => RootState) => {
    return enqueueDataOperation(async () => {
      const state = getState()

      return JSON.stringify(
        createBackup(selectPhrases(state), selectLearningLimit(state), selectShows(state)),
        null,
        2,
      )
    })
  }
}
