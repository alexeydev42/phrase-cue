import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { enqueueDataOperation } from '../../app/dataOperationQueue'
import { phraseReducer } from '../phrase/phraseSlice'
import { settingsReducer } from '../settings/settingsSlice'
import { addShow, setActiveEpisodeId, sourceReducer } from './sourceSlice'
import { subscribeToShowsPersistence } from './sourceStorage'
import type { Show } from './sourceTypes'

const mocks = vi.hoisted(() => ({
  put: vi.fn(),
}))

vi.mock('../../app/db', () => ({
  dbPromise: Promise.resolve({
    put: mocks.put,
  }),
}))

const createStore = () =>
  configureStore({
    reducer: {
      settings: settingsReducer,
      source: sourceReducer,
      phrase: phraseReducer,
    },
  })

const show: Show = { id: 'show-1', title: 'Friends', seasons: [] }

beforeEach(() => {
  mocks.put.mockReset()
  mocks.put.mockResolvedValue(undefined)
})

describe('subscribeToShowsPersistence', () => {
  it('waits for preceding queued operations before saving source data', async () => {
    const store = createStore()
    const unsubscribe = subscribeToShowsPersistence(store)

    let release!: () => void
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    const precedingOperation = enqueueDataOperation(() => pending)

    store.dispatch(addShow(show))

    await Promise.resolve()
    expect(mocks.put).not.toHaveBeenCalled()

    release()
    await precedingOperation
    await enqueueDataOperation(async () => {})

    expect(mocks.put).toHaveBeenCalledTimes(1)
    expect(mocks.put).toHaveBeenCalledWith('source', [show], 'shows')

    unsubscribe()
  })

  it('persists successive show changes in dispatch order', async () => {
    const store = createStore()
    const unsubscribe = subscribeToShowsPersistence(store)
    const secondShow: Show = { id: 'show-2', title: 'Breaking Bad', seasons: [] }

    store.dispatch(addShow(show))
    store.dispatch(addShow(secondShow))
    await enqueueDataOperation(async () => {})

    expect(mocks.put).toHaveBeenCalledTimes(2)
    expect(mocks.put).toHaveBeenNthCalledWith(1, 'source', [show], 'shows')
    expect(mocks.put).toHaveBeenNthCalledWith(2, 'source', [show, secondShow], 'shows')

    unsubscribe()
  })

  it('does not save shows when only activeEpisodeId changes', async () => {
    const store = createStore()
    const unsubscribe = subscribeToShowsPersistence(store)

    store.dispatch(setActiveEpisodeId('episode-1'))
    await enqueueDataOperation(async () => {})

    expect(mocks.put).not.toHaveBeenCalled()

    unsubscribe()
  })
})
