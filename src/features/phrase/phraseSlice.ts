import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit'
import type { Phrase, PhraseStatus } from './phraseTypes'
import type { RootState } from '../../app/store'

interface PhraseState {
  phrases: Phrase[]
}

const initialState: PhraseState = {
  phrases: [],
}

const phraseSlice = createSlice({
  name: 'phrase',
  initialState,
  reducers: {
    addPhrase(state, action: PayloadAction<Phrase>) {
      state.phrases.push(action.payload)
    },
    hydratePhrases(state, action: PayloadAction<Phrase[]>) {
      state.phrases = action.payload
    },
    changePhraseStatus(
      state,
      action: PayloadAction<{
        phraseId: string
        status: PhraseStatus
        statusChangedAt: string
      }>,
    ) {
      const phrase = state.phrases.find((phrase) => phrase.id === action.payload.phraseId)
      if (!phrase) {
        return
      }
      phrase.status = action.payload.status
      phrase.statusChangedAt = action.payload.statusChangedAt
    },
    deletePhrase(state, action: PayloadAction<string>) {
      state.phrases = state.phrases.filter((phrase) => phrase.id !== action.payload)
    },
    updatePhraseTranslation(
      state,
      action: PayloadAction<{
        phraseId: string
        russianText: string
      }>,
    ) {
      const phrase = state.phrases.find((phrase) => phrase.id === action.payload.phraseId)
      if (!phrase) {
        return
      }
      phrase.russianText = action.payload.russianText
    },
  },
})

export const {
  addPhrase,
  hydratePhrases,
  changePhraseStatus,
  deletePhrase,
  updatePhraseTranslation,
} = phraseSlice.actions

export const phraseReducer = phraseSlice.reducer

export const selectPhrases = (state: RootState) => state.phrase.phrases
const selectStatus = (_state: RootState, status: PhraseStatus) => status

export const selectPhrasesByStatus = createSelector(
  [selectPhrases, selectStatus],
  (phrases, status) => {
    return phrases
      .filter((phrase) => phrase.status === status)
      .sort((a, b) => b.statusChangedAt.localeCompare(a.statusChangedAt))
  },
)
