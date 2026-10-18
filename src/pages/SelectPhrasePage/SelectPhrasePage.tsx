import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { BackLink } from '../../components/BackLink/BackLink'
import { Button } from '../../components/Button/Button'
import { normalizePhraseDraft } from '../../features/phrase/normalizePhraseDraft'
import { translatePhrase } from '../../features/phrase/translatePhrase'
import { selectActiveEpisode, selectShows } from '../../features/source/sourceSlice'
import { savePhrase } from '../../features/phrase/phraseThunks'
import { formatTimecode } from '../../features/source/timecode'
import { useTranslation } from '../../i18n/useTranslation'
import type { Phrase } from '../../features/phrase/phraseTypes'

import styles from './SelectPhrasePage.module.css'

export const SelectPhrasePage = () => {
  const dispatch = useAppDispatch()
  const t = useTranslation()
  const navigate = useNavigate()
  const { cueId } = useParams()

  const activeEpisode = useAppSelector(selectActiveEpisode)
  const shows = useAppSelector(selectShows)
  const cues = activeEpisode?.cues ?? []
  const initialIndex = cues.findIndex((cue) => cue.id === cueId)
  const cue = cues[initialIndex]

  const [selection, setSelection] = useState({ before: 0, after: 0 })
  const [draftOverride, setDraftOverride] = useState<string | null>(null)
  const [translation, setTranslation] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationError, setTranslationError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const draft = draftOverride ?? cue?.text ?? ''
  const normalizedDraft = normalizePhraseDraft(draft).trim()
  const characterCount = normalizedDraft.length
  const isOverLimit = characterCount > 300
  const canTranslate = characterCount > 0 && !isOverLimit
  const isReviewing = isTranslating || translation !== null || translationError

  const startIndex = initialIndex - selection.before
  const endIndex = initialIndex + selection.after
  const selectedCues = initialIndex >= 0 ? cues.slice(startIndex, endIndex + 1) : []
  const selectedCount = selectedCues.length
  const canAddPrevious = initialIndex >= 0 && startIndex > 0 && selectedCount < 3
  const canAddNext = initialIndex >= 0 && endIndex < cues.length - 1 && selectedCount < 3
  const canResetSelection = selectedCount > 1 || draftOverride !== null

  const handleAddPrevious = () => {
    if (!canAddPrevious || isReviewing) return

    const previousCue = cues[startIndex - 1]
    setDraftOverride(`${previousCue.text} ${draft}`)
    setSelection((current) => ({ ...current, before: current.before + 1 }))
  }

  const handleAddNext = () => {
    if (!canAddNext || isReviewing) return

    const nextCue = cues[endIndex + 1]
    setDraftOverride(`${draft} ${nextCue.text}`)
    setSelection((current) => ({ ...current, after: current.after + 1 }))
  }

  const handleResetSelection = () => {
    if (isReviewing) return

    setDraftOverride(null)
    setSelection({ before: 0, after: 0 })
  }

  const show = shows.find((show) =>
    show.seasons.some((season) =>
      season.episodes.some((episode) => episode.id === activeEpisode?.id),
    ),
  )

  const season = show?.seasons.find((season) =>
    season.episodes.some((episode) => episode.id === activeEpisode?.id),
  )

  const episodeLabel =
    activeEpisode && season
      ? t.metadata.shortSeasonEpisode
          .replace('{season}', String(season.number))
          .replace('{episode}', String(activeEpisode.number))
      : null

  const handleTranslate = async () => {
    if (!canTranslate || isReviewing) return

    setIsTranslating(true)
    setTranslation(null)
    setTranslationError(false)

    try {
      const result = await translatePhrase(normalizedDraft)
      setTranslation(result)
    } catch {
      setTranslationError(true)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSave = async (russianText?: string) => {
    if (!cue || !activeEpisode || !show || !season || !canTranslate || isSaving) {
      return
    }

    const now = new Date().toISOString()

    const newPhrase: Phrase = {
      id: crypto.randomUUID(),
      englishText: normalizedDraft,
      ...(russianText !== undefined && { russianText }),
      status: 'new' as const,
      createdAt: now,
      statusChangedAt: now,
      source: {
        showTitle: show.title,
        seasonNumber: season.number,
        episodeNumber: activeEpisode.number,
        timecodeMs: selectedCues[0]?.startMs ?? cue.startMs,
      },
    }

    setIsSaving(true)
    setSaveError(false)
    try {
      await dispatch(savePhrase(newPhrase))

      navigate('/', {
        state: {
          phraseSaveNotice: russianText === undefined ? 'withoutTranslation' : 'translated',
        },
      })
    } catch {
      setSaveError(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <BackLink to='/'>{t.common.back}</BackLink>
        <h1 className={styles.title}>{t.selectPhrase.title}</h1>
      </div>

      {cue ? (
        <>
          {show && episodeLabel && (
            <p className={styles.metadata}>
              {show.title} · {episodeLabel} ·{' '}
              {formatTimecode(selectedCues[0]?.startMs ?? cue.startMs)}
            </p>
          )}

          <div className={clsx(styles.content, isReviewing && styles.contentReview)}>
            <div className={styles.selectionSide}>
              <div className={styles.selectedPanel}>
                <p className={styles.selectedLabel}>
                  {t.selectPhrase.selectedCues.replace('{count}', String(selectedCount))}
                </p>

                {selectedCues.map((selectedCue) => (
                  <div key={selectedCue.id} className={styles.selectedCue}>
                    <span className={styles.cueTime}>{formatTimecode(selectedCue.startMs)}</span>
                    <span className={styles.cueText}>{selectedCue.text}</span>
                  </div>
                ))}
              </div>

              <div className={styles.cueControls}>
                <Button
                  variant='secondary'
                  onClick={handleAddPrevious}
                  disabled={!canAddPrevious || isReviewing}
                >
                  {t.selectPhrase.previous}
                </Button>
                <Button
                  variant='secondary'
                  onClick={handleAddNext}
                  disabled={!canAddNext || isReviewing}
                >
                  {t.selectPhrase.next}
                </Button>
              </div>

              <p className={styles.selectionHint}>{t.selectPhrase.selectionHint}</p>
            </div>

            {isReviewing ? (
              <div className={clsx(styles.draftSide, styles.reviewSide)}>
                <div className={styles.phrasePanel}>
                  <p className={styles.reviewLabel}>{t.selectPhrase.phraseLabel}</p>
                  <p className={styles.phraseText}>{normalizedDraft}</p>
                </div>

                <div
                  className={clsx(
                    styles.translationPanel,
                    isTranslating && styles.translationLoading,
                  )}
                  aria-live='polite'
                >
                  <p className={styles.reviewLabel}>{t.selectPhrase.translationLabel}</p>

                  {isTranslating ? (
                    <p className={styles.translatingText}>{t.selectPhrase.translating}</p>
                  ) : translationError ? (
                    <p className={styles.translationError} role='alert'>
                      {t.selectPhrase.translationFailed}
                    </p>
                  ) : (
                    <p className={styles.translationText}>{translation}</p>
                  )}
                </div>

                <div className={clsx(styles.actions, isTranslating && styles.actionsSingle)}>
                  {translation !== null && (
                    <Button
                      variant='primary'
                      fullWidth
                      onClick={() => handleSave(translation)}
                      loading={isSaving}
                      loadingLabel={t.selectPhrase.saving}
                    >
                      {t.common.save}
                    </Button>
                  )}
                  {translationError && (
                    <Button
                      variant='primary'
                      fullWidth
                      onClick={() => handleSave()}
                      loading={isSaving}
                      loadingLabel={t.selectPhrase.saving}
                    >
                      {t.selectPhrase.saveWithoutTranslation}
                    </Button>
                  )}
                  <Button
                    variant='secondary'
                    fullWidth
                    onClick={handleCancel}
                    disabled={isTranslating || isSaving}
                  >
                    {t.common.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.draftSide}>
                <label className={styles.draftLabel} htmlFor='phrase-draft'>
                  {t.selectPhrase.draftLabel}
                </label>
                <textarea
                  className={styles.draftTextarea}
                  id='phrase-draft'
                  value={draft}
                  onChange={(event) => setDraftOverride(event.target.value)}
                  disabled={isSaving}
                />
                <p className={styles.characterCounter}>
                  <span className={isOverLimit ? styles.characterCountExceeded : undefined}>
                    {characterCount}
                  </span>
                  {' / 300'}
                </p>

                {isOverLimit && (
                  <p className={styles.characterLimitMessage}>
                    {t.selectPhrase.characterLimitExceeded}
                  </p>
                )}
                <p className={styles.draftHint}>{t.selectPhrase.draftHint}</p>

                {canResetSelection && (
                  <div className={styles.resetRow}>
                    <Button variant='secondary' onClick={handleResetSelection}>
                      {t.selectPhrase.resetSelection}
                    </Button>
                  </div>
                )}

                <div className={styles.actions}>
                  <Button
                    variant='primary'
                    fullWidth
                    onClick={handleTranslate}
                    disabled={!canTranslate || isSaving}
                  >
                    {t.selectPhrase.translate}
                  </Button>
                  <Button
                    variant='secondary'
                    fullWidth
                    onClick={() => handleSave()}
                    disabled={!canTranslate}
                    loading={isSaving}
                    loadingLabel={t.selectPhrase.saving}
                  >
                    {t.selectPhrase.saveWithoutTranslation}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className={styles.metadata}>{t.selectPhrase.cueNotFound}</p>
      )}
      {saveError && (
        <p className={styles.saveError} role='alert'>
          {t.selectPhrase.saveFailed}
        </p>
      )}
    </section>
  )
}
