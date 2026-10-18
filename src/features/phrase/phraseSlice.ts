import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Phrase } from './phraseTypes'
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
