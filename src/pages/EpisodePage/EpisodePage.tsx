import { useNavigate } from 'react-router'
import { useTranslation } from '../../i18n/useTranslation'
import { useAppSelector } from '../../app/hooks'
import { selectActiveEpisode, selectShows } from '../../features/source/sourceSlice'
import { Button } from '../../components/Button/Button'

import styles from './EpisodePage.module.css'

export const EpisodePage = () => {
  const t = useTranslation()
  const navigate = useNavigate()
  const activeEpisode = useAppSelector(selectActiveEpisode)
  const shows = useAppSelector(selectShows)

  const show = shows.find((show) =>
    show.seasons.some((season) =>
      season.episodes.some((episode) => episode.id === activeEpisode?.id)
    )
  )
  const season = show?.seasons.find((season) =>
    season.episodes.some((episode) => episode.id === activeEpisode?.id)
  )

  if (activeEpisode && show && season) {
    return (
      <section className={styles.page}>
        <div className={styles.head}>
          <h1 className={styles.title}>{show.title}</h1>
          <p className={styles.subtitle}>
            {t.source.season.replace('{number}', String(season.number))}
            {' · '}
            {t.source.episode.replace('{number}', String(activeEpisode.number))}
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.placeholder}>
            <p className={styles.status}>{t.episode.underDevelopment}</p>
            <p className={styles.description}>
              {t.episode.underDevelopmentHint}
            </p>
          </div>

          <div className={styles.actions}>
            <Button
              variant='secondary'
              fullWidth
              onClick={() => navigate('/episode/shows')}
            >
              {t.episode.changeEpisode}
            </Button>
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
          onClick={() =>
            navigate(hasShows ? '/episode/shows' : '/episode/shows/new')
          }
        >
          {hasShows ? t.episode.chooseEpisode : t.episode.addShow}
        </Button>
      </div>
    </section>
  )
}
