let pendingOperation: Promise<unknown> = Promise.resolve()

export const enqueueDataOperation = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = pendingOperation.then(operation)

  pendingOperation = result.catch(() => {})

  return result
}
