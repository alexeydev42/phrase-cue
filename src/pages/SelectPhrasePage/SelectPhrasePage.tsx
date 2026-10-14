import { useParams } from 'react-router'
import { useAppSelector } from '../../app/hooks'
import { selectActiveEpisode, selectShows } from '../../features/source/sourceSlice'
import { formatTimecode } from '../../features/source/timecode'
import { useTranslation } from '../../i18n/useTranslation'
import { BackLink } from '../../components/BackLink/BackLink'

import styles from './SelectPhrasePage.module.css'

export const SelectPhrasePage = () => {
  const t = useTranslation()
  const { cueId } = useParams()

  const activeEpisode = useAppSelector(selectActiveEpisode)
  const shows = useAppSelector(selectShows)

  const cue = activeEpisode?.cues.find((cue) => cue.id === cueId)

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
              {show.title} · {episodeLabel} · {formatTimecode(cue.startMs)}
            </p>
          )}

          <div className={styles.selectedPanel}>
            <p className={styles.selectedLabel}>
              {t.selectPhrase.selectedCues.replace('{count}', '1')}
            </p>

            <div className={styles.selectedCue}>
              <span className={styles.cueTime}>{formatTimecode(cue.startMs)}</span>
              <span className={styles.cueText}>{cue.text}</span>
            </div>
          </div>
        </>
      ) : (
        <p className={styles.metadata}>{t.selectPhrase.cueNotFound}</p>
      )}
    </section>
  )
}
