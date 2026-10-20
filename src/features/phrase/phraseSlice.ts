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
  },
})
export const { addPhrase, hydratePhrases } = phraseSlice.actions

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
