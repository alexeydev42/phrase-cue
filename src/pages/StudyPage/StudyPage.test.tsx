// @vitest-environment jsdom
import { configureStore } from '@reduxjs/toolkit'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  phraseReducer,
  hydratePhrases,
  changePhraseStatus,
} from '../../features/phrase/phraseSlice'
import { savePhrases } from '../../features/phrase/phraseStorage'
import type { Phrase, PhraseStatus } from '../../features/phrase/phraseTypes'
import { settingsReducer } from '../../features/settings/settingsSlice'
import { sourceReducer } from '../../features/source/sourceSlice'
import { StudyPage } from './StudyPage'

vi.mock('../../features/phrase/phraseStorage', () => ({
  savePhrases: vi.fn(),
}))

const createPhrase = (id: string, status: PhraseStatus = 'learning'): Phrase => ({
  id,
  englishText: `English ${id}`,
  russianText: `Перевод ${id}`,
  status,
  createdAt: '2026-10-01T12:00:00.000Z',
  statusChangedAt: '2026-10-01T12:00:00.000Z',
  source: {
    showTitle: 'Friends',
    seasonNumber: 1,
    episodeNumber: 1,
    timecodeMs: 60000,
  },
})

const createStore = (phrases: Phrase[]) => {
  const store = configureStore({
    reducer: {
      phrase: phraseReducer,
      settings: settingsReducer,
      source: sourceReducer,
    },
  })

  store.dispatch(hydratePhrases(phrases))

  return store
}

const renderStudy = (phrases: Phrase[]) => {
  const store = createStore(phrases)

  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <StudyPage />
      </MemoryRouter>
    </Provider>,
  )

  return { store, ...view }
}

const revealTranslation = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Show translation' }))
}

const mockedSave = vi.mocked(savePhrases)

beforeEach(() => {
  mockedSave.mockReset()
  mockedSave.mockResolvedValue(undefined)

  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('StudyPage', () => {
  it('shows the empty state when there are no Learning phrases', () => {
    renderStudy([createPhrase('A', 'new'), createPhrase('B', 'learned')])

    expect(screen.getByRole('heading', { name: 'No phrases to study' })).toBeTruthy()
    expect(screen.getByText(/Move phrases from New to Learning/)).toBeTruthy()

    const link = screen.getByRole('link', { name: 'Go to New' })
    expect(link.getAttribute('href')).toBe('/library')
  })

  it('shows English first and reveals translation and source on request', () => {
    renderStudy([createPhrase('A')])

    expect(screen.getByText('English A')).toBeTruthy()
    expect(screen.queryByText('Перевод A')).toBeNull()
    expect(screen.queryByText(/Friends · Season 1/)).toBeNull()

    revealTranslation()

    expect(screen.getByText('Перевод A')).toBeTruthy()
    expect(screen.getByText(/Friends · Season 1/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next phrase' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Learned' })).toBeTruthy()
  })

  it('visits every phrase once before starting another cycle', () => {
    renderStudy([createPhrase('A'), createPhrase('B'), createPhrase('C')])

    // With Math.random = 0, Fisher-Yates produces B, C, A.
    const expectedOrder = ['B', 'C', 'A']

    expectedOrder.forEach((id, index) => {
      expect(screen.getByText(`English ${id}`)).toBeTruthy()
      expect(screen.getByText(`${index + 1} / 3`)).toBeTruthy()

      revealTranslation()
      fireEvent.click(screen.getByRole('button', { name: 'Next phrase' }))
    })

    expect(screen.getByText('1 / 3')).toBeTruthy()
    expect(screen.getByText('English B')).toBeTruthy()
    expect(screen.queryByText('Перевод B')).toBeNull()
  })

  it('keeps phrases in Learning when Next phrase is clicked', () => {
    const { store } = renderStudy([createPhrase('A'), createPhrase('B')])

    revealTranslation()
    fireEvent.click(screen.getByRole('button', { name: 'Next phrase' }))

    expect(screen.getByText('2 / 2')).toBeTruthy()
    expect(store.getState().phrase.phrases.every((phrase) => phrase.status === 'learning')).toBe(
      true,
    )
    expect(mockedSave).not.toHaveBeenCalled()
  })

  it('moves a phrase to Learned and updates progress', async () => {
    const { store } = renderStudy([createPhrase('A'), createPhrase('B'), createPhrase('C')])

    expect(screen.getByText('English B')).toBeTruthy()
    expect(screen.getByText('1 / 3')).toBeTruthy()

    revealTranslation()
    fireEvent.click(screen.getByRole('button', { name: 'Learned' }))

    await waitFor(() => {
      expect(store.getState().phrase.phrases.find((phrase) => phrase.id === 'B')?.status).toBe(
        'learned',
      )
      expect(screen.getByText('1 / 2')).toBeTruthy()
    })

    expect(screen.getByText('English C')).toBeTruthy()
    expect(screen.queryByText('Перевод C')).toBeNull()
    expect(mockedSave).toHaveBeenCalledTimes(1)
  })

  it('shows the empty state after the last phrase is learned', async () => {
    const { store } = renderStudy([createPhrase('A')])

    revealTranslation()
    fireEvent.click(screen.getByRole('button', { name: 'Learned' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'No phrases to study' })).toBeTruthy()
    })

    expect(store.getState().phrase.phrases[0].status).toBe('learned')
    expect(screen.queryByText('English A')).toBeNull()
  })

  it('keeps the phrase available when saving Learned fails', async () => {
    mockedSave.mockRejectedValueOnce(new Error('Storage failed'))

    const { store } = renderStudy([createPhrase('A')])

    revealTranslation()
    fireEvent.click(screen.getByRole('button', { name: 'Learned' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('Could not update the phrase')
    })

    expect(store.getState().phrase.phrases[0].status).toBe('learning')
    expect(screen.getByText('English A')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Learned' })).toBeTruthy()
  })

  it('starts a fresh shuffled cycle when Study is reopened', () => {
    const phrases = [createPhrase('A'), createPhrase('B'), createPhrase('C')]
    const store = createStore(phrases)

    const renderPage = () =>
      render(
        <Provider store={store}>
          <MemoryRouter>
            <StudyPage />
          </MemoryRouter>
        </Provider>,
      )

    const firstVisit = renderPage()

    expect(screen.getByText('English B')).toBeTruthy()

    firstVisit.unmount()

    vi.mocked(Math.random).mockReturnValue(0.99)

    renderPage()

    expect(screen.getByText('English A')).toBeTruthy()
    expect(screen.getByText('1 / 3')).toBeTruthy()
  })

  it('recalculates progress when a previous phrase leaves Learning', () => {
    const { store } = renderStudy([createPhrase('A'), createPhrase('B'), createPhrase('C')])

    // Initial order: B, C, A.
    revealTranslation()
    fireEvent.click(screen.getByRole('button', { name: 'Next phrase' }))

    expect(screen.getByText('English C')).toBeTruthy()
    expect(screen.getByText('2 / 3')).toBeTruthy()

    act(() => {
      store.dispatch(
        changePhraseStatus({
          phraseId: 'B',
          status: 'learned',
          statusChangedAt: new Date().toISOString(),
        }),
      )
    })

    expect(screen.getByText('English C')).toBeTruthy()
    expect(screen.getByText('1 / 2')).toBeTruthy()
  })
})
