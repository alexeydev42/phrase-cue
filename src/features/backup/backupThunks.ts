import type { AppDispatch, RootState } from '../../app/store'
import { enqueueDataOperation } from '../../app/dataOperationQueue'
import { hydratePhrases, selectPhrases } from '../phrase/phraseSlice'
import { selectLearningLimit, setLearningLimit } from '../settings/settingsSlice'
import { createBackup, type PhraseCueBackup } from './backup'
import { replaceBackupData } from './backupStorage'

export const restoreBackup = (backup: PhraseCueBackup) => {
  return (dispatch: AppDispatch) => {
    return enqueueDataOperation(async () => {
      await replaceBackupData(backup)

      dispatch(hydratePhrases(backup.phrases))
      dispatch(setLearningLimit(backup.settings.learningLimit))
    })
  }
}

export const exportBackup = () => {
  return (_dispatch: AppDispatch, getState: () => RootState) => {
    return enqueueDataOperation(async () => {
      const state = getState()
      const phrases = selectPhrases(state)
      const learningLimit = selectLearningLimit(state)

      return JSON.stringify(createBackup(phrases, learningLimit), null, 2)
    })
  }
}
