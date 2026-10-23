import { dbPromise } from '../../app/db'
import type { PhraseCueBackup } from './backup'

export const replaceBackupData = async (backup: PhraseCueBackup): Promise<void> => {
  const db = await dbPromise
  const transaction = db.transaction(['phrases', 'settings'], 'readwrite')

  await Promise.all([
    transaction.objectStore('phrases').put(backup.phrases, 'items'),
    transaction.objectStore('settings').put(backup.settings.learningLimit, 'learningLimit'),
    transaction.done,
  ])
}
