import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { PhraseCard } from '../../components/PhraseCard/PhraseCard'
import { selectPhrasesByStatus } from '../../features/phrase/phraseSlice'
import type { Phrase, PhraseStatus } from '../../features/phrase/phraseTypes'
import { useTranslation } from '../../i18n/useTranslation'
import {
  transitionPhraseStatus,
  savePhraseTranslation,
  removePhrase,
} from '../../features/phrase/phraseThunks'
import { translatePhrase, TranslationLimitError } from '../../features/phrase/translatePhrase'
import { selectLearningLimit } from '../../features/settings/settingsSlice'
import { ConfirmationDialog } from '../../components/ConfirmationDialog/ConfirmationDialog'

import styles from './LibraryPage.module.css'

const tabs: PhraseStatus[] = ['new', 'learning', 'learned']

export const LibraryPage = () => {
  const dispatch = useAppDispatch()
  const learningLimit = useAppSelector(selectLearningLimit)
  const learningCount = useAppSelector((state) => selectPhrasesByStatus(state, 'learning').length)
  const isLearningLimitReached = learningCount >= learningLimit
  const t = useTranslation()
  const [expandedPhraseId, setExpandedPhraseId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PhraseStatus>('new')
  const [translatingPhraseId, setTranslatingPhraseId] = useState<string | null>(null)
  const [translationError, setTranslationError] = useState<{
    phraseId: string
    kind: 'limit' | 'generic'
  } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [phraseToDeleteId, setPhraseToDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const phrases = useAppSelector((state) => selectPhrasesByStatus(state, activeTab))

  const handleToggleTabs = (status: PhraseStatus) => {
    setActiveTab(status)
    setExpandedPhraseId(null)
  }

  const handleToggle = (phraseId: string) => {
    setExpandedPhraseId((currentId) => (currentId === phraseId ? null : phraseId))
  }

  const handleTranslatePhrase = async (phrase: Phrase) => {
    setTranslatingPhraseId(phrase.id)
    setTranslationError(null)

    try {
      const russianText = await translatePhrase(phrase.englishText)
      await dispatch(savePhraseTranslation(phrase.id, russianText))
    } catch (error) {
      setTranslationError({
        phraseId: phrase.id,
        kind: error instanceof TranslationLimitError ? 'limit' : 'generic',
      })
    } finally {
      setTranslatingPhraseId(null)
    }
  }

  const handleStatusChange = async (phrase: Phrase) => {
    if (phrase.status === 'new' && !phrase.russianText?.trim()) {
      await handleTranslatePhrase(phrase)
      return
    }

    const nextStatus: PhraseStatus =
      phrase.status === 'new' ? 'learning' : phrase.status === 'learning' ? 'learned' : 'learning'

    await dispatch(transitionPhraseStatus(phrase.id, nextStatus))
  }

  const handleDeleteRequest = (phraseId: string) => {
    setDeleteError(null)
    setPhraseToDeleteId(phraseId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!phraseToDeleteId || isDeleting) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await dispatch(removePhrase(phraseToDeleteId))

      setIsDeleteDialogOpen(false)
      setPhraseToDeleteId(null)
    } catch {
      setDeleteError(t.library.deleteFailed)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    if (isDeleting) return

    setIsDeleteDialogOpen(false)
    setPhraseToDeleteId(null)
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
              onPrimaryAction={() => handleStatusChange(phrase)}
              onDelete={() => handleDeleteRequest(phrase.id)}
              isPrimaryActionDisabled={
                isLearningLimitReached &&
                (phrase.status === 'learned' ||
                  (phrase.status === 'new' && Boolean(phrase.russianText?.trim())))
              }
              isTranslating={translatingPhraseId === phrase.id}
              translationError={
                translationError?.phraseId === phrase.id ? translationError.kind : null
              }
            />
          ))}
        </div>
      )}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title={t.library.deletePhraseTitle}
        body={t.library.deletePhraseBody}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={isDeleting}
        error={deleteError}
      />
    </section>
  )
}
