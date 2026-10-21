import { describe, expect, it } from 'vitest'
import { enqueueDataOperation } from './dataOperationQueue'

describe('enqueueDataOperation', () => {
  it('runs operations sequentially', async () => {
    const events: string[] = []
    let finishFirst!: () => void
    const firstGate = new Promise<void>((resolve) => {
      finishFirst = resolve
    })

    const first = enqueueDataOperation(async () => {
      events.push('first:start')
      await firstGate
      events.push('first:end')
    })

    const second = enqueueDataOperation(async () => {
      events.push('second:start')
      events.push('second:end')
    })

    await Promise.resolve()
    expect(events).toEqual(['first:start'])

    finishFirst()
    await Promise.all([first, second])
    expect(events).toEqual(['first:start', 'first:end', 'second:start', 'second:end'])
  })

  it('continues after failure while rejecting the failed operation', async () => {
    const first = enqueueDataOperation(async () => {
      throw new Error('Failure')
    })
    const second = enqueueDataOperation(async () => 'done')

    await expect(first).rejects.toThrow('Failure')
    await expect(second).resolves.toBe('done')
  })
})
