import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBackup } from './backup'
import { replaceBackupData } from './backupStorage'

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
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
    put: name === 'phrases' ? mocks.phrasesPut : mocks.settingsPut,
  }),
  done,
})

beforeEach(() => {
  mocks.transaction.mockReset()
  mocks.phrasesPut.mockReset()
  mocks.settingsPut.mockReset()

  mocks.phrasesPut.mockResolvedValue(undefined)
  mocks.settingsPut.mockResolvedValue(undefined)
  mocks.transaction.mockReturnValue(createTransaction())
})

describe('replaceBackupData', () => {
  it('writes phrases and Learning limit in one readwrite transaction', async () => {
    const backup = createBackup([], 12)

    await replaceBackupData(backup)

    expect(mocks.transaction).toHaveBeenCalledTimes(1)
    expect(mocks.transaction).toHaveBeenCalledWith(['phrases', 'settings'], 'readwrite')
    expect(mocks.phrasesPut).toHaveBeenCalledWith([], 'items')
    expect(mocks.settingsPut).toHaveBeenCalledWith(12, 'learningLimit')
  })

  it('rejects when the transaction fails', async () => {
    mocks.transaction.mockReturnValueOnce(
      createTransaction(Promise.reject(new Error('Transaction failed'))),
    )

    await expect(replaceBackupData(createBackup([], 10))).rejects.toThrow('Transaction failed')
  })
})
