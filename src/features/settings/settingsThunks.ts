import type { AppDispatch, RootState } from '../../app/store'
import { selectPhrases } from '../phrase/phraseSlice'
import { setLearningLimit } from './settingsSlice'
import { loadLearningLimit, saveLearningLimit } from './settingsStorage'

export const updateLearningLimit = (limit: number) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const phrases = selectPhrases(state)

    const learningCount = phrases.filter((phrase) => phrase.status === 'learning').length

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return
    }

    if (limit < learningCount) {
      return
    }

    await saveLearningLimit(limit)
    dispatch(setLearningLimit(limit))
  }
}

export const hydrateLearningLimit = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const limit = await loadLearningLimit()

    if (limit === undefined || !Number.isInteger(limit) || limit < 1 || limit > 50) {
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
