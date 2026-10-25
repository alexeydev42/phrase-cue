import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import clsx from 'clsx'

import { useTranslation } from '../../i18n/useTranslation'
import { useAppSelector } from '../../app/hooks'
import { selectActiveEpisode, selectShows } from '../../features/source/sourceSlice'
import { selectCueWindow } from '../../features/source/cueSelectors'
import { findNearestCueIndex, searchCuesByText } from '../../features/source/cueSearch'
import { parseTimecode, formatTimecode } from '../../features/source/timecode'
import { useEpisodeReturn } from '../../features/source/episodeReturnContext'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'

import styles from './EpisodePage.module.css'

const LOAD_STEP = 5
const TEXT_RESULT_STEP = 30

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

    setSearchMode('timecode')
    setTextQuery('')
    setVisibleTextCount(TEXT_RESULT_STEP)
    setTargetMs(null)

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
  const [searchMode, setSearchMode] = useState<'timecode' | 'text'>(
    returnState?.searchMode ?? 'timecode',
  )
  const [textQuery, setTextQuery] = useState(returnState?.textQuery ?? '')
  const [visibleTextCount, setVisibleTextCount] = useState(
    returnState?.visibleTextCount ?? TEXT_RESULT_STEP,
  )

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

  const textMatches = searchCuesByText(activeEpisode?.cues ?? [], textQuery)

  const hasTextSearch = searchMode === 'text' && textQuery.trim().length > 0
  const hasTimecodeSearch = searchMode === 'timecode' && targetMs !== null
  const hasSearch = hasTextSearch || hasTimecodeSearch

  const visibleCues = hasTextSearch ? textMatches.slice(0, visibleTextCount) : cueWindow

  const hasMoreTextMatches = hasTextSearch && visibleTextCount < textMatches.length

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
    setSearchMode('timecode')
    setTargetMs(parsedTime)
    setBeforeCount(3)
    setAfterCount(3)
  }

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTextQuery(event.target.value)
    setTimecodeInput('')
    setTargetMs(null)
    setVisibleTextCount(TEXT_RESULT_STEP)
    setSearchMode('text')
  }

  const loadMoreTextMatches = () => {
    setVisibleTextCount((count) => count + TEXT_RESULT_STEP)
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
      searchMode,
      timecodeInput,
      targetMs,
      beforeCount,
      afterCount,
      textQuery,
      visibleTextCount,
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

        <div className={clsx(styles.episodeBody, hasTextSearch && styles.episodeBodyTextSearch)}>
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

            <div className={styles.textSearch}>
              <div className={styles.searchDivider}>
                <span>{t.episode.orSearchByText}</span>
              </div>

              <Input
                type='search'
                aria-label={t.episode.textSearchLabel}
                placeholder={t.episode.textSearchPlaceholder}
                autoComplete='off'
                value={textQuery}
                onChange={handleTextChange}
              />
            </div>

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
                {hasTextSearch
                  ? t.episode.textResultsCount.replace('{count}', String(textMatches.length))
                  : hasTimecodeSearch
                    ? t.episode.nearbyCues
                    : t.episode.searchResults}
              </h2>

              <p className={styles.panelDescription}>
                {hasTextSearch
                  ? t.episode.textResultsHint
                  : hasTimecodeSearch
                    ? t.episode.nearbyCuesHint
                    : t.episode.searchResultsHint}
              </p>
            </div>

            {hasSearch ? (
              <>
                {hasTimecodeSearch && hasEarlier && (
                  <button type='button' className={styles.loadMore} onClick={loadEarlier}>
                    {t.episode.loadEarlier}
                  </button>
                )}

                {visibleCues.length > 0 ? (
                  <ul ref={hasTimecodeSearch ? listRef : undefined} className={styles.cueList}>
                    {visibleCues.map((cue, index) => (
                      <li
                        className={clsx(
                          styles.cueCard,
                          hasTimecodeSearch && index === nearestCueIndex && styles.cueNearest,
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
                ) : (
                  <div className={styles.noTextMatches} role='status'>
                    <p className={styles.noTextMatchesTitle}>{t.episode.noTextMatches}</p>
                    <p className={styles.noTextMatchesHint}>{t.episode.noTextMatchesHint}</p>
                  </div>
                )}

                {hasTimecodeSearch && hasLater && (
                  <button type='button' className={styles.loadMore} onClick={loadLater}>
                    {t.episode.loadLater}
                  </button>
                )}

                {hasMoreTextMatches && (
                  <button type='button' className={styles.loadMore} onClick={loadMoreTextMatches}>
                    {t.episode.loadMoreMatches}
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

  const sampleSrtUrl = `${import.meta.env.BASE_URL}samples/PhraseCue.Demo.S01E01.srt`

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t.navigation.episode}</h1>
        <p className={styles.subtitle}>
          {hasShows ? t.episode.noActiveEpisode : t.episode.onboardingSubtitle}
        </p>
      </div>

      <div className={styles.emptyPanel}>
        {hasShows ? (
          <>
            <p className={styles.emptyText}>{t.episode.noActiveEpisodeHint}</p>
            <Button variant='primary' fullWidth onClick={() => navigate('/episode/shows')}>
              {t.episode.chooseEpisode}
            </Button>
          </>
        ) : (
          <>
            <h2 className={styles.onboardingTitle}>{t.episode.onboardingTitle}</h2>

            <p className={styles.onboardingDescription}>{t.episode.onboardingDescription}</p>

            <p className={styles.onboardingDescription}>{t.episode.onboardingStartHint}</p>

            <Button variant='primary' fullWidth onClick={() => navigate('/episode/shows/new')}>
              {t.episode.addShow}
            </Button>

            <div className={styles.sampleSection}>
              <p className={styles.sampleHint}>{t.episode.onboardingSampleHint}</p>
              <a className={styles.sampleLink} href={sampleSrtUrl} download>
                {t.episode.downloadSampleSrt}
              </a>
            </div>

            <p className={styles.storageNotice}>{t.episode.onboardingStorageNotice}</p>
          </>
        )}
      </div>

      {!hasShows && <p className={styles.translationNotice}>{t.episode.translationNotice}</p>}
    </section>
  )
}
