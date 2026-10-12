
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useTranslation } from '../../i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { removeSeason, selectShows } from '../../features/source/sourceSlice'
import { BackLink } from '../../components/BackLink/BackLink'
import { Button } from '../../components/Button/Button'
import { Surface } from '../../components/Surface/Surface'
import { ConfirmationDialog } from '../../components/ConfirmationDialog/ConfirmationDialog'

import styles from './SeasonPage.module.css'

export const SeasonPage = () => {
  const t = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { showId, seasonId } = useParams()
  const shows = useAppSelector(selectShows)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const show = shows.find((show) => show.id === showId)
  const season = show?.seasons.find((season) => season.id === seasonId)

  if (!show) {
    return <p>{t.source.showNotFound}</p>
  }

  if (!season) {
    return <p>{t.source.seasonNotFound}</p>
  }

  const handleConfirmDelete = () => {
    dispatch(removeSeason({ showId: show.id, seasonId: season.id }))
    navigate(`/episode/shows/${show.id}`, { replace: true })
  }

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <BackLink to={`/episode/shows/${show.id}`}>
          {show.title}
        </BackLink>
        <h1 className={styles.title}>
          {t.source.season.replace('{number}', String(season.number))}
        </h1>
        <p className={styles.subtitle}>{show.title}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.actions}>
          <Button
            variant='primary'
            fullWidth
            onClick={() =>
              navigate(`/episode/shows/${show.id}/seasons/${season.id}/import`)
            }
          >
            {t.source.importSrt}
          </Button>

          <Button
            variant='secondary'
            fullWidth
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            {t.source.deleteSeason}
          </Button>
        </div>

        <div className={styles.listPanel}>
          <p className={styles.listLabel}>{t.source.episodes}</p>

          <ul className={styles.episodeList}>
            {season.episodes.map((episode) => (
              <li key={episode.id} className={styles.episodeItem}>
                <Link
                  to={`/episode/shows/${show.id}/seasons/${season.id}/episodes/${episode.id}`}
                  className={styles.episodeLink}
                >
                  <Surface className={styles.episodeCard}>
                    <h2 className={styles.episodeTitle}>
                      {t.source.episode.replace(
                        '{number}',
                        String(episode.number),
                      )}
                    </h2>
                    <p className={styles.episodeMeta}>
                      {t.source.importedSubtitles}
                    </p>
                  </Surface>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title={t.source.deleteSeasonTitle}
        body={t.source.deleteSeasonBody}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </section>
  )
}
