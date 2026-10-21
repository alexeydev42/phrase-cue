import { dbPromise } from '../../app/db'

export const saveLearningLimit = async (limit: number): Promise<void> => {
  const db = await dbPromise
  await db.put('settings', limit, 'learningLimit')
}

export const loadLearningLimit = async (): Promise<number | undefined> => {
  const db = await dbPromise
  return db.get('settings', 'learningLimit')
}
