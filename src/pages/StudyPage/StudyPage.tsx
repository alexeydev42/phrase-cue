import { useState } from 'react'
import { Link } from 'react-router'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Button } from '../../components/Button/Button'
import { selectPhrasesByStatus } from '../../features/phrase/phraseSlice'
import { transitionPhraseStatus } from '../../features/phrase/phraseThunks'
import type { Phrase } from '../../features/phrase/phraseTypes'
import { useTranslation } from '../../i18n/useTranslation'

import styles from './StudyPage.module.css'

type StudyCycle = {
  ids: string[]
  index: number
}

const shuffleIds = (ids: string[]): string[] => {
  const shuffled = [...ids]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

const createCycle = (phrases: Phrase[]): StudyCycle => ({
  ids: shuffleIds(phrases.map((phrase) => phrase.id)),
  index: 0,
})

export const StudyPage = () => {
  const dispatch = useAppDispatch()
  const t = useTranslation()

  const phrases = useAppSelector((state) => selectPhrasesByStatus(state, 'learning'))

  const [cycle, setCycle] = useState<StudyCycle>(() => createCycle(phrases))
  const [revealedPhraseId, setRevealedPhraseId] = useState<string | null>(null)
  const [isMarkingLearned, setIsMarkingLearned] = useState(false)
  const [failedPhraseId, setFailedPhraseId] = useState<string | null>(null)

  const learningIds = new Set(phrases.map((phrase) => phrase.id))

  const activeCycleIds = [
    ...cycle.ids.filter((id) => learningIds.has(id)),
    ...phrases.map((phrase) => phrase.id).filter((id) => !cycle.ids.includes(id)),
  ]

  const currentIndex = cycle.ids.slice(0, cycle.index).filter((id) => learningIds.has(id)).length

  const currentPhrase = phrases.find((phrase) => phrase.id === activeCycleIds[currentIndex])

  const isTranslationVisible = revealedPhraseId === currentPhrase?.id

  const handleNextPhrase = () => {
    if (!currentPhrase || isMarkingLearned) return

    if (currentIndex === activeCycleIds.length - 1) {
      setCycle(createCycle(phrases))
    } else {
      setCycle({
        ids: activeCycleIds,
        index: currentIndex + 1,
      })
    }

    setRevealedPhraseId(null)
    setFailedPhraseId(null)
  }

  const handleLearned = async () => {
    if (!currentPhrase || isMarkingLearned) return

    const phraseId = currentPhrase.id

    setIsMarkingLearned(true)
    setFailedPhraseId(null)

    try {
      await dispatch(transitionPhraseStatus(phraseId, 'learned'))

      const remainingPhrases = phrases.filter((phrase) => phrase.id !== phraseId)
      const remainingIds = activeCycleIds.filter((id) => id !== phraseId)

      if (remainingIds.length === 0 || currentIndex >= remainingIds.length) {
        setCycle(createCycle(remainingPhrases))
      } else {
        setCycle({
          ids: remainingIds,
          index: currentIndex,
        })
      }

      setRevealedPhraseId(null)
    } catch {
      setFailedPhraseId(phraseId)
    } finally {
      setIsMarkingLearned(false)
    }
  }

  const episodeLabel = currentPhrase
    ? t.metadata.seasonEpisode
        .replace('{season}', String(currentPhrase.source.seasonNumber))
        .replace('{episode}', String(currentPhrase.source.episodeNumber))
    : ''

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t.navigation.study}</h1>
        <p className={styles.subtitle}>{t.study.learningPhrases}</p>
      </header>

      {phrases.length === 0 ? (
        <div className={styles.studyContent}>
          <div className={styles.emptyState}>
            <h2 className={styles.emptyStateTitle}>{t.study.noPhrases}</h2>
            <p className={styles.emptyStateHint}>{t.study.noPhrasesHint}</p>
          </div>

          <Link to='/library' className={styles.emptyStateLink}>
            {t.study.goToNew}
          </Link>
        </div>
      ) : (
        <div className={styles.studyContent}>
          <div className={styles.progress}>
            <span className={styles.progressValue}>
              {currentIndex + 1} / {activeCycleIds.length}
            </span>
            <span className={styles.progressLabel}>{t.study.currentCycle}</span>
          </div>

          {currentPhrase && (
            <>
              <article className={styles.studyCard}>
                <p className={styles.englishText}>{currentPhrase.englishText}</p>

                {isTranslationVisible && (
                  <div className={styles.answer}>
                    <p className={styles.translation}>
                      {currentPhrase.russianText ?? t.library.noTranslation}
                    </p>
                    <p className={styles.metadata}>
                      {currentPhrase.source.showTitle} · {episodeLabel}
                    </p>
                  </div>
                )}
              </article>

              <div className={styles.actions}>
                {isTranslationVisible ? (
                  <>
                    <Button
                      variant='primary'
                      fullWidth
                      className={styles.actionButton}
                      disabled={isMarkingLearned}
                      onClick={handleNextPhrase}
                    >
                      {t.study.nextPhrase}
                    </Button>

                    <Button
                      variant='secondary'
                      fullWidth
                      className={styles.actionButton}
                      loading={isMarkingLearned}
                      onClick={() => void handleLearned()}
                    >
                      {t.study.learned}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant='primary'
                    fullWidth
                    onClick={() => setRevealedPhraseId(currentPhrase.id)}
                  >
                    {t.study.showTranslation}
                  </Button>
                )}

                {failedPhraseId === currentPhrase.id && (
                  <p className={styles.error} role='alert'>
                    {t.study.updateFailed}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
