import { Link, useNavigate } from 'react-router'
import { useAppSelector } from '../../app/hooks'
import { selectShows } from '../../features/source/sourceSlice'
import { useTranslation } from '../../i18n/useTranslation'
import { Button } from '../../components/Button/Button'
import { Surface } from '../../components/Surface/Surface'
import { BackLink } from '../../components/BackLink/BackLink'

import styles from './ShowsPage.module.css'

export const ShowsPage = () => {
  const t = useTranslation()
  const shows = useAppSelector(selectShows)
  const navigate = useNavigate()

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <BackLink to='/'>
          {t.navigation.episode}
        </BackLink>
        <h1 className={styles.title}>{t.source.shows}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.actions}>
          <Button
            variant='primary'
            fullWidth
            onClick={() => navigate('/episode/shows/new')}
          >
            {t.source.addShow}
          </Button>
        </div>

        <div className={styles.listPanel}>
          <p className={styles.listLabel}>{t.source.yourShows}</p>

          <ul className={styles.showList}>
            {shows.map((show) => {
              return (
                <li key={show.id} className={styles.showItem}>
                  <Link
                    to={`/episode/shows/${show.id}`}
                    className={styles.showLink}
                  >
                    <Surface className={styles.showCard}>
                      <h2 className={styles.showTitle}>{show.title}</h2>
                      <p className={styles.showMeta}>
                        {t.source.seasonsCount.replace(
                          '{count}',
                          String(show.seasons.length),
                        )}
                      </p>
                    </Surface>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}