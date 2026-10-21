import { useId } from 'react'

import type { Phrase } from '../../features/phrase/phraseTypes'
import { formatTimecode } from '../../features/source/timecode'
import { useTranslation } from '../../i18n/useTranslation'
import { Button } from '../Button/Button'

import styles from './PhraseCard.module.css'

interface PhraseCardProps {
  phrase: Phrase
  isExpanded: boolean
  onToggle: () => void
  onPrimaryAction: () => void
  onDelete: () => void
  isPrimaryActionDisabled: boolean
  isTranslating: boolean
  hasTranslationError: boolean
}

export const PhraseCard = ({
  phrase,
  isExpanded,
  onToggle,
  onPrimaryAction,
  onDelete,
  isPrimaryActionDisabled,
  isTranslating,
  hasTranslationError,
}: PhraseCardProps) => {
  const t = useTranslation()
  const contentId = useId()

  const statusLabels = {
    new: t.library.statusNew,
    learning: t.library.statusLearning,
    learned: t.library.statusLearned,
  }

  const episodeLabel = t.metadata.shortSeasonEpisode
    .replace('{season}', String(phrase.source.seasonNumber))
    .replace('{episode}', String(phrase.source.episodeNumber))

  let primaryActionLabel: string

  if (phrase.status === 'new') {
    primaryActionLabel = phrase.russianText?.trim() ? t.library.startLearning : t.library.translate
  } else if (phrase.status === 'learning') {
    primaryActionLabel = t.study.learned
  } else {
    primaryActionLabel = t.library.learnAgain
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        <button
          type='button'
          className={styles.toggle}
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? contentId : undefined}
        >
          <span className={styles.englishText}>{phrase.englishText}</span>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
            aria-hidden='true'
          />
        </button>

        {isExpanded && (
          <div id={contentId} className={styles.content}>
            <p className={styles.translation}>{phrase.russianText ?? t.library.noTranslation}</p>

            <div className={styles.metadata}>
              <span>{phrase.source.showTitle}</span>
              <span>{episodeLabel}</span>
              <span>{formatTimecode(phrase.source.timecodeMs)}</span>
            </div>

            <p className={styles.status}>{statusLabels[phrase.status]}</p>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className={styles.actions}>
          <Button
            variant='primary'
            className={styles.actionButton}
            onClick={onPrimaryAction}
            disabled={isPrimaryActionDisabled || isTranslating}
            loading={isTranslating}
            loadingLabel={t.selectPhrase.translating}
          >
            {primaryActionLabel}
          </Button>
          {hasTranslationError && (
            <p className={styles.actionError} role='alert'>
              {t.selectPhrase.translationFailed}
            </p>
          )}

          <Button variant='secondary' className={styles.actionButton} onClick={onDelete}>
            {t.common.delete}
          </Button>
        </div>
      )}
    </article>
  )
}
