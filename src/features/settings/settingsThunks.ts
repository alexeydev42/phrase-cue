import type { AppDispatch, RootState } from '../../app/store'
import { selectPhrases } from '../phrase/phraseSlice'
import { setLearningLimit } from './settingsSlice'
import { loadLearningLimit, saveLearningLimit } from './settingsStorage'
import { enqueueDataOperation } from '../../app/dataOperationQueue'
import { isValidLearningLimit } from './learningLimitValidation'

export const updateLearningLimit = (limit: number) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    return enqueueDataOperation(async () => {
      const state = getState()
      const phrases = selectPhrases(state)

      const learningCount = phrases.filter((phrase) => phrase.status === 'learning').length

      if (!isValidLearningLimit(limit)) {
        return
      }

      if (limit < learningCount) {
        return
      }

      await saveLearningLimit(limit)
      dispatch(setLearningLimit(limit))
    })
  }
}

export const hydrateLearningLimit = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const limit = await loadLearningLimit()

    if (limit === undefined || !isValidLearningLimit(limit)) {
      return
    }

    const learningCount = selectPhrases(getState()).filter(
      (phrase) => phrase.status === 'learning',
    ).length

    if (limit < learningCount) {
      return
    }

    dispatch(setLearningLimit(limit))
  }
}
