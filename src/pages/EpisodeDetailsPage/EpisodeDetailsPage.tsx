
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  removeEpisode,
  selectShows,
  setActiveEpisodeId,
} from '../../features/source/sourceSlice'
import { useTranslation } from '../../i18n/useTranslation'
import { BackLink } from '../../components/BackLink/BackLink'
import { Button } from '../../components/Button/Button'
import { ConfirmationDialog } from '../../components/ConfirmationDialog/ConfirmationDialog'
import { Surface } from '../../components/Surface/Surface'

import styles from './EpisodeDetailsPage.module.css'

export const EpisodeDetailsPage = () => {
  const t = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { showId, seasonId, episodeId } = useParams()
  const shows = useAppSelector(selectShows)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const show = shows.find((show) => show.id === showId)
  const season = show?.seasons.find((season) => season.id === seasonId)
  const episode = season?.episodes.find(
    (episode) => episode.id === episodeId
  )

  if (!show) {
    return <p>{t.source.showNotFound}</p>
  }

  if (!season) {
    return <p>{t.source.seasonNotFound}</p>
  }

  const seasonPath =
    `/episode/shows/${show.id}/seasons/${season.id}`

  if (!episode) {
    return <Navigate to={seasonPath} replace />
  }

  const seasonTitle = t.source.season.replace(
    '{number}',
    String(season.number)
  )

  const episodeTitle = t.source.episode.replace(
    '{number}',
    String(episode.number)
  )

  const handleOpenEpisode = () => {
    dispatch(setActiveEpisodeId(episode.id))
    navigate('/', { replace: true })
  }

  const handleConfirmDelete = () => {
    dispatch(
      removeEpisode({
        showId: show.id,
        seasonId: season.id,
        episodeId: episode.id,
      })
    )

    navigate(seasonPath, { replace: true })
  }

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <BackLink to={seasonPath}>
          {seasonTitle}
          <span className={styles.backShow}>
            {' · '}{show.title}
          </span>
        </BackLink>

        <h1 className={styles.title}>{episodeTitle}</h1>

        <p className={styles.subtitle}>
          {show.title} · {seasonTitle}
        </p>
      </div>

      <div className={styles.content}>
        <Surface className={styles.episodeCard}>
          <h2 className={styles.episodeTitle}>
            {episodeTitle}
          </h2>

          <p className={styles.episodeMeta}>
            {t.source.subtitlesImported}
          </p>

          <p className={styles.episodeHint}>
            {t.source.openingSetsActive}
          </p>
        </Surface>

        <div className={styles.actions}>
          <Button
            variant='primary'
            fullWidth
            onClick={handleOpenEpisode}
          >
            {t.source.openEpisode}
          </Button>

          <Button
            variant='secondary'
            fullWidth
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            {t.source.deleteEpisode}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title={t.source.deleteEpisodeTitle}
        body={t.source.deleteEpisodeBody}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </section>
  )
}
