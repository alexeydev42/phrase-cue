import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import clsx from 'clsx'

import { useTranslation } from '../../i18n/useTranslation'
import { useAppSelector } from '../../app/hooks'
import { selectActiveEpisode, selectShows } from '../../features/source/sourceSlice'
import { selectCueWindow } from '../../features/source/cueSelectors'
import { findNearestCueIndex } from '../../features/source/cueSearch'
import { parseTimecode, formatTimecode } from '../../features/source/timecode'
import { useEpisodeReturn } from '../../features/source/episodeReturnContext'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'

import styles from './EpisodePage.module.css'

const LOAD_STEP = 5

export const EpisodePage = () => {
  const t = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [saveNotice, setSaveNotice] = useState<'translated' | 'withoutTranslation' | null>(() => {
    const notice: unknown = location.state?.phraseSaveNotice

    return notice === 'translated' || notice === 'withoutTranslation' ? notice : null
  })

  const activeEpisode = useAppSelector(selectActiveEpisode)
  const shows = useAppSelector(selectShows)

  const { snapshot, remember, clear } = useEpisodeReturn()

  const [returnState] = useState(() =>
    snapshot?.episodeId === activeEpisode?.id ? snapshot : null,
  )

  const [timecodeInput, setTimecodeInput] = useState(returnState?.timecodeInput ?? '')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    if (value.includes(':') && parseTimecode(value) !== null) {
      setTimecodeInput(value)
      return
    }

    const digits = value.replace(/\D/g, '').slice(0, 6)

    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)].filter(Boolean)

    setTimecodeInput(parts.join(':'))
  }

  const listRef = useRef<HTMLUListElement>(null)
  const previousFirstCue = useRef<{ element: Element; top: number } | null>(null)

  const [targetMs, setTargetMs] = useState<number | null>(returnState?.targetMs ?? null)
  const [beforeCount, setBeforeCount] = useState(returnState?.beforeCount ?? 3)
  const [afterCount, setAfterCount] = useState(returnState?.afterCount ?? 3)

  const show = shows.find((show) =>
    show.seasons.some((season) =>
      season.episodes.some((episode) => episode.id === activeEpisode?.id),
    ),
  )

  const season = show?.seasons.find((season) =>
    season.episodes.some((episode) => episode.id === activeEpisode?.id),
  )

  const cueWindow = useAppSelector((state) =>
    selectCueWindow(state, targetMs, beforeCount, afterCount),
  )

  const nearestCueIndex = targetMs !== null ? findNearestCueIndex(cueWindow, targetMs) : null

  const nearestEpisodeIndex =
    targetMs !== null ? findNearestCueIndex(activeEpisode?.cues ?? [], targetMs) : null

  const hasSearch = targetMs !== null

  const hasEarlier = nearestEpisodeIndex !== null && nearestEpisodeIndex > beforeCount

  const hasLater =
    nearestEpisodeIndex !== null &&
    activeEpisode !== undefined &&
    nearestEpisodeIndex + afterCount < activeEpisode.cues.length - 1

  useEffect(() => {
    if (saveNotice === null) {
      return
    }

    navigate('/', { replace: true, state: null })

    const timeoutId = window.setTimeout(() => {
      setSaveNotice(null)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [saveNotice, navigate])

  useLayoutEffect(() => {
    if (returnState) {
      window.scrollTo(0, returnState.pageScrollY)
    }

    clear()
  }, [returnState, clear])

  useLayoutEffect(() => {
    const anchor = previousFirstCue.current

    if (anchor) {
      const shift = anchor.element.getBoundingClientRect().top - anchor.top
      if (shift !== 0) {
        window.scrollBy(0, shift)
      }
    }

    previousFirstCue.current = null
  }, [beforeCount])

  const handleSearch = () => {
    const parsedTime = parseTimecode(timecodeInput)

    if (parsedTime === null) {
      return
    }

    previousFirstCue.current = null
    setTargetMs(parsedTime)
    setBeforeCount(3)
    setAfterCount(3)
  }

  const loadEarlier = () => {
    const firstCue = listRef.current?.firstElementChild
    if (firstCue) {
      previousFirstCue.current = {
        element: firstCue,
        top: firstCue.getBoundingClientRect().top,
      }
    }

    setBeforeCount((count) => count + LOAD_STEP)
  }

  const loadLater = () => {
    setAfterCount((count) => count + LOAD_STEP)
  }

  const handleSelectCue = (cueId: string) => {
    if (!activeEpisode) {
      return
    }

    remember({
      episodeId: activeEpisode.id,
      timecodeInput,
      targetMs,
      beforeCount,
      afterCount,
      pageScrollY: window.scrollY,
    })

    navigate(`/episode/select/${cueId}`)
  }

  if (activeEpisode && show && season) {
    const episodeLabel = t.metadata.seasonEpisode
      .replace('{season}', String(season.number))
      .replace('{episode}', String(activeEpisode.number))

    return (
      <section className={styles.page}>
        {saveNotice !== null && (
          <div className={styles.saveToast} role='status'>
            {saveNotice === 'translated'
              ? t.selectPhrase.phraseSaved
              : t.selectPhrase.savedWithoutTranslation}
          </div>
        )}
        <div className={styles.head}>
          <h1 className={styles.title}>{show.title}</h1>
          <p className={styles.subtitle}>{episodeLabel}</p>
        </div>

        <div className={styles.episodeBody}>
          <div className={styles.controls}>
            <div className={styles.searchIntro}>
              <h2 className={styles.panelTitle}>{t.episode.findPhrase}</h2>
              <p className={styles.panelDescription}>{t.episode.approximateTimecodeHint}</p>
            </div>

            <div className={styles.searchRow}>
              <Input
                id='timecode'
                variant='time'
                type='text'
                inputMode='numeric'
                placeholder={t.episode.timeStampPlaceholder}
                aria-label={t.episode.enterApproximateTimecode}
                value={timecodeInput}
                onChange={handleChange}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSearch()
                  }
                }}
                maxLength={8}
              />

              <Button variant='primary' fullWidth onClick={handleSearch}>
                {t.common.search}
              </Button>
            </div>

            {!hasSearch && (
              <p className={styles.mobileHint}>{t.episode.enterApproximateTimecode}</p>
            )}

            <div className={styles.episodeContext}>
              <p className={styles.contextLabel}>{t.episode.currentEpisode}</p>
              <p className={styles.contextShow}>{show.title}</p>
              <p className={styles.contextEpisode}>{episodeLabel}</p>
              <p className={styles.contextStatus}>{t.episode.activeEpisode}</p>
            </div>

            <div className={styles.actions}>
              <Button variant='secondary' fullWidth onClick={() => navigate('/episode/shows')}>
                {t.episode.changeEpisode}
              </Button>
            </div>
          </div>

          <div className={clsx(styles.results, !hasSearch && styles.resultsIdle)}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.panelTitle}>
                {hasSearch ? t.episode.nearbyCues : t.episode.searchResults}
              </h2>

              <p className={styles.panelDescription}>
                {hasSearch ? t.episode.nearbyCuesHint : t.episode.searchResultsHint}
              </p>
            </div>

            {hasSearch ? (
              <>
                {hasEarlier && (
                  <button type='button' className={styles.loadMore} onClick={loadEarlier}>
                    {t.episode.loadEarlier}
                  </button>
                )}

                <ul ref={listRef} className={styles.cueList}>
                  {cueWindow.map((cue, index) => (
                    <li
                      className={clsx(
                        styles.cueCard,
                        index === nearestCueIndex && styles.cueNearest,
                      )}
                      key={cue.id}
                    >
                      <button
                        type='button'
                        className={styles.cueButton}
                        onClick={() => handleSelectCue(cue.id)}
                      >
                        <span className={styles.cueTime}>{formatTimecode(cue.startMs)}</span>
                        <span className={styles.cueText}>{cue.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {hasLater && (
                  <button type='button' className={styles.loadMore} onClick={loadLater}>
                    {t.episode.loadLater}
                  </button>
                )}
              </>
            ) : (
              <div className={styles.emptyResults}>
                <p className={styles.emptyResultsTitle}>{t.episode.noSubtitleList}</p>
                <p className={styles.emptyResultsDescription}>{t.episode.noSubtitleListHint}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  const hasShows = shows.length > 0

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t.navigation.episode}</h1>
        <p className={styles.subtitle}>
          {hasShows ? t.episode.noActiveEpisode : t.episode.noShowsYet}
        </p>
      </div>

      <div className={styles.emptyPanel}>
        <p className={styles.emptyText}>
          {hasShows ? t.episode.noActiveEpisodeHint : t.episode.noShowsYetHint}
        </p>

        <Button
          variant='primary'
          fullWidth
          onClick={() => navigate(hasShows ? '/episode/shows' : '/episode/shows/new')}
        >
          {hasShows ? t.episode.chooseEpisode : t.episode.addShow}
        </Button>
      </div>
      {!hasShows && <p className={styles.translationNotice}>{t.episode.translationNotice}</p>}
    </section>
  )
}
