import { useState } from 'react'

import { PhraseCard } from '../../components/PhraseCard/PhraseCard'
import type { Phrase } from '../../features/phrase/phraseTypes'
import { useTranslation } from '../../i18n/useTranslation'

import styles from './LibraryPage.module.css'

const previewPhrases: Phrase[] = [
  {
    id: 'preview-1',
    englishText: 'You must have known that.',
    russianText: 'Ты должен был это знать.',
    status: 'new',
    createdAt: '2026-10-19T12:00:00.000Z',
    statusChangedAt: '2026-10-19T12:00:00.000Z',
    source: {
      showTitle: 'Better Call Saul',
      seasonNumber: 1,
      episodeNumber: 5,
      timecodeMs: 1122000,
    },
  },
  {
    id: 'preview-2',
    englishText: 'I was wondering if you could help me out.',
    russianText: 'Я хотел спросить, не мог бы ты мне помочь.',
    status: 'learning',
    createdAt: '2026-10-18T12:00:00.000Z',
    statusChangedAt: '2026-10-19T13:00:00.000Z',
    source: {
      showTitle: 'Friends',
      seasonNumber: 3,
      episodeNumber: 4,
      timecodeMs: 742000,
    },
  },
  {
    id: 'preview-3',
    englishText: 'It is not what it looks like.',
    status: 'learned',
    createdAt: '2026-10-17T12:00:00.000Z',
    statusChangedAt: '2026-10-19T14:00:00.000Z',
    source: {
      showTitle: 'The Big Bang Theory',
      seasonNumber: 2,
      episodeNumber: 7,
      timecodeMs: 482000,
    },
  },
]

export const LibraryPage = () => {
  const t = useTranslation()
  const [expandedPhraseId, setExpandedPhraseId] = useState<string | null>(null)

  const handleToggle = (phraseId: string) => {
    setExpandedPhraseId((currentId) => (currentId === phraseId ? null : phraseId))
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{t.library.title}</h1>

      <div className={styles.phraseGrid}>
        {previewPhrases.map((phrase) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            isExpanded={expandedPhraseId === phrase.id}
            onToggle={() => handleToggle(phrase.id)}
          />
        ))}
      </div>
    </section>
  )
}
