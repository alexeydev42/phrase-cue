import type { AppDispatch, RootState } from '../../app/store'
import type { Phrase, PhraseStatus } from './phraseTypes'
import {
  addPhrase,
  changePhraseStatus,
  deletePhrase,
  selectPhrases,
  updatePhraseTranslation,
} from './phraseSlice'
import { savePhrases } from './phraseStorage'
import { selectLearningLimit } from '../settings/settingsSlice'
import { enqueueDataOperation } from '../../app/dataOperationQueue'

export const savePhrase = (phrase: Phrase) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    return enqueueDataOperation(async () => {
      const existingPhrases = selectPhrases(getState())

      await savePhrases([...existingPhrases, phrase])

      dispatch(addPhrase(phrase))
    })
  }
}

const canTransitionPhraseStatus = (
  currentStatus: PhraseStatus,
  nextStatus: PhraseStatus,
): boolean => {
  if (currentStatus === 'new' && nextStatus === 'learning') return true
  if (currentStatus === 'learning' && nextStatus === 'learned') return true
  if (currentStatus === 'learned' && nextStatus === 'learning') return true

  return false
}

export const transitionPhraseStatus = (phraseId: string, nextStatus: PhraseStatus) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    return enqueueDataOperation(async () => {
      const phrases = selectPhrases(getState())
      const phrase = phrases.find((phrase) => phrase.id === phraseId)

      if (!phrase || !canTransitionPhraseStatus(phrase.status, nextStatus)) {
        return
      }
      if (phrase.status === 'new' && nextStatus === 'learning' && !phrase.russianText?.trim()) {
        return
      }
      if (nextStatus === 'learning') {
        const learningLimit = selectLearningLimit(getState())
        const learningCount = phrases.filter((phrase) => phrase.status === 'learning').length

        if (learningCount >= learningLimit) {
          return
        }
      }

      const statusChangedAt = new Date().toISOString()

      const updatedPhrases = phrases.map((phrase) =>
        phrase.id === phraseId ? { ...phrase, status: nextStatus, statusChangedAt } : phrase,
      )

      await savePhrases(updatedPhrases)

      dispatch(
        changePhraseStatus({
          phraseId,
          status: nextStatus,
          statusChangedAt,
        }),
      )
    })
  }
}

export const removePhrase = (phraseId: string) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    return enqueueDataOperation(async () => {
      const phrases = selectPhrases(getState())
      const updatedPhrases = phrases.filter((phrase) => phrase.id !== phraseId)

      if (updatedPhrases.length === phrases.length) {
        return
      }

      await savePhrases(updatedPhrases)

      dispatch(deletePhrase(phraseId))
    })
  }
}

export const savePhraseTranslation = (phraseId: string, russianText: string) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    return enqueueDataOperation(async () => {
      const phrases = selectPhrases(getState())
      const phraseExists = phrases.some((phrase) => phrase.id === phraseId)

      if (!phraseExists) {
        return
      }

      const trimmedTranslation = russianText.trim()

      if (!trimmedTranslation) {
        return
      }

      const updatedPhrases = phrases.map((phrase) =>
        phrase.id === phraseId ? { ...phrase, russianText: trimmedTranslation } : phrase,
      )

      await savePhrases(updatedPhrases)

      dispatch(
        updatePhraseTranslation({
          phraseId,
          russianText: trimmedTranslation,
        }),
      )
    })
  }
}
