import type { AppDispatch, RootState } from '../../app/store'
import type { Phrase } from './phraseTypes'
import { addPhrase, selectPhrases } from './phraseSlice'
import { savePhrases } from './phraseStorage'

export const savePhrase = (phrase: Phrase) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const existingPhrases = selectPhrases(getState())

    await savePhrases([...existingPhrases, phrase])

    dispatch(addPhrase(phrase))
  }
}
