import { useState } from 'react'
import { useParams } from 'react-router'
import { useAppSelector } from '../../app/hooks'
import { selectActiveEpisode, selectShows } from '../../features/source/sourceSlice'
import { formatTimecode } from '../../features/source/timecode'
import { useTranslation } from '../../i18n/useTranslation'
import { BackLink } from '../../components/BackLink/BackLink'
import { Button } from '../../components/Button/Button'

import styles from './SelectPhrasePage.module.css'

export const SelectPhrasePage = () => {
  const t = useTranslation()
  const { cueId } = useParams()

  const activeEpisode = useAppSelector(selectActiveEpisode)
  const shows = useAppSelector(selectShows)

  const cues = activeEpisode?.cues ?? []

  const initialIndex = cues.findIndex((cue) => cue.id === cueId)

  const cue = cues[initialIndex]

  const [selection, setSelection] = useState({
    before: 0,
    after: 0,
  })

  const [draftOverride, setDraftOverride] = useState<string | null>(null)
  const draft = draftOverride ?? cue?.text ?? ''

  const startIndex = initialIndex - selection.before
  const endIndex = initialIndex + selection.after
  const selectedCues = initialIndex >= 0 ? cues.slice(startIndex, endIndex + 1) : []
  const selectedCount = selectedCues.length
  const canAddPrevious = initialIndex >= 0 && startIndex > 0 && selectedCount < 3
  const canAddNext = initialIndex >= 0 && endIndex < cues.length - 1 && selectedCount < 3

  const handleAddPrevious = () => {
    if (!canAddPrevious) return

    const previousCue = cues[startIndex - 1]

    setDraftOverride(`${previousCue.text} ${draft}`)

    setSelection((current) => ({
      ...current,
      before: current.before + 1,
    }))
  }

  const handleAddNext = () => {
    if (!canAddNext) return

    const nextCue = cues[endIndex + 1]

    setDraftOverride(`${draft} ${nextCue.text}`)

    setSelection((current) => ({
      ...current,
      after: current.after + 1,
    }))
  }

  const canResetSelection = selectedCount > 1 || draftOverride !== null

  const handleResetSelection = () => {
    setDraftOverride(null)

    setSelection({
      before: 0,
      after: 0,
    })
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

          <div className={styles.content}>
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
                <Button variant='secondary' onClick={handleAddPrevious} disabled={!canAddPrevious}>
                  {t.selectPhrase.previous}
                </Button>
                <Button variant='secondary' onClick={handleAddNext} disabled={!canAddNext}>
                  {t.selectPhrase.next}
                </Button>
              </div>

              <p className={styles.selectionHint}>{t.selectPhrase.selectionHint}</p>
            </div>

            <div className={styles.draftSide}>
              <label className={styles.draftLabel} htmlFor='phrase-draft'>
                {t.selectPhrase.draftLabel}
              </label>
              <textarea
                className={styles.draftTextarea}
                id='phrase-draft'
                value={draft}
                onChange={(event) => setDraftOverride(event.target.value)}
              />
              <p className={styles.draftHint}>{t.selectPhrase.draftHint}</p>

              {canResetSelection && (
                <div className={styles.resetRow}>
                  <Button variant='secondary' onClick={handleResetSelection}>
                    {t.selectPhrase.resetSelection}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className={styles.metadata}>{t.selectPhrase.cueNotFound}</p>
      )}
    </section>
  )
}
