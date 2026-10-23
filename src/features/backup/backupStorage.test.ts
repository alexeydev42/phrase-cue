import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Show } from '../source/sourceTypes'
import { createBackup } from './backup'
import { replaceBackupData } from './backupStorage'

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  sourcePut: vi.fn(),
  phrasesPut: vi.fn(),
  settingsPut: vi.fn(),
}))

vi.mock('../../app/db', () => ({
  dbPromise: Promise.resolve({
    transaction: mocks.transaction,
  }),
}))

const createTransaction = (done: Promise<void> = Promise.resolve()) => ({
  objectStore: (name: string) => ({
    put:
      name === 'source'
        ? mocks.sourcePut
        : name === 'phrases'
          ? mocks.phrasesPut
          : mocks.settingsPut,
  }),
  done,
})

const shows: Show[] = [{ id: 'show-1', title: 'Friends', seasons: [] }]

beforeEach(() => {
  mocks.transaction.mockReset()
  mocks.sourcePut.mockReset()
  mocks.phrasesPut.mockReset()
  mocks.settingsPut.mockReset()

  mocks.sourcePut.mockResolvedValue(undefined)
  mocks.phrasesPut.mockResolvedValue(undefined)
  mocks.settingsPut.mockResolvedValue(undefined)
  mocks.transaction.mockReturnValue(createTransaction())
})

describe('replaceBackupData', () => {
  it('writes shows, phrases and Learning limit in one readwrite transaction', async () => {
    const backup = createBackup([], 12, shows)

    await replaceBackupData(backup)

    expect(mocks.transaction).toHaveBeenCalledTimes(1)
    expect(mocks.transaction).toHaveBeenCalledWith(['source', 'phrases', 'settings'], 'readwrite')
    expect(mocks.sourcePut).toHaveBeenCalledWith(shows, 'shows')
    expect(mocks.phrasesPut).toHaveBeenCalledWith([], 'items')
    expect(mocks.settingsPut).toHaveBeenCalledWith(12, 'learningLimit')
  })

  it('rejects when the transaction fails', async () => {
    mocks.transaction.mockReturnValueOnce(
      createTransaction(Promise.reject(new Error('Transaction failed'))),
    )

    await expect(replaceBackupData(createBackup([], 10, shows))).rejects.toThrow(
      'Transaction failed',
    )
  })

  it('rejects when writing the source data fails', async () => {
    mocks.sourcePut.mockRejectedValueOnce(new Error('Source write failed'))

    await expect(replaceBackupData(createBackup([], 10, shows))).rejects.toThrow(
      'Source write failed',
    )
  })
})
