import { useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { PhraseCard } from '../../components/PhraseCard/PhraseCard'
import { selectPhrasesByStatus } from '../../features/phrase/phraseSlice'
import type { PhraseStatus } from '../../features/phrase/phraseTypes'
import { useTranslation } from '../../i18n/useTranslation'

import styles from './LibraryPage.module.css'

const tabs: PhraseStatus[] = ['new', 'learning', 'learned']

export const LibraryPage = () => {
  const t = useTranslation()
  const [expandedPhraseId, setExpandedPhraseId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PhraseStatus>('new')
  const phrases = useAppSelector((state) => selectPhrasesByStatus(state, activeTab))

  const handleToggleTabs = (status: PhraseStatus) => {
    setActiveTab(status)
    setExpandedPhraseId(null)
  }

  const handleToggle = (phraseId: string) => {
    setExpandedPhraseId((currentId) => (currentId === phraseId ? null : phraseId))
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{t.library.title}</h1>

      <div className={styles.toolbar}>
        <div className={styles.tabs} aria-label={t.library.title}>
          {tabs.map((status) => (
            <button
              key={status}
              type='button'
              className={`${styles.tab} ${activeTab === status ? styles.tabActive : ''}`}
              aria-pressed={activeTab === status}
              onClick={() => handleToggleTabs(status)}
            >
              {t.library.tabs[status]}
            </button>
          ))}
        </div>

        <span className={styles.sortLabel}>{t.library.newestFirst}</span>
      </div>

      {phrases.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyStateTitle}>{t.library.emptyStates[activeTab].title}</h2>
          <p className={styles.emptyStateHint}>{t.library.emptyStates[activeTab].hint}</p>
        </div>
      ) : (
        <div className={styles.phraseGrid}>
          {phrases.map((phrase) => (
            <PhraseCard
              key={phrase.id}
              phrase={phrase}
              isExpanded={expandedPhraseId === phrase.id}
              onToggle={() => handleToggle(phrase.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
