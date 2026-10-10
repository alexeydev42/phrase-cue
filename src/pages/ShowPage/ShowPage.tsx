import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectShows, removeShow } from '../../features/source/sourceSlice'
import { useTranslation } from '../../i18n/useTranslation'
import { BackLink } from '../../components/BackLink/BackLink'
import { Button } from '../../components/Button/Button'
import { Surface } from '../../components/Surface/Surface'
import { ConfirmationDialog } from '../../components/ConfirmationDialog/ConfirmationDialog'

import styles from './ShowPage.module.css'

export const ShowPage = () => {
  const t = useTranslation()
  const navigate = useNavigate()
  const { showId } = useParams()
  const shows = useAppSelector(selectShows)
  const dispatch = useAppDispatch()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const show = shows.find((show) => show.id === showId)
  if (!show) {
    return <p>{t.source.showNotFound}</p>
  }

  const handleConfirmDelete = () => {
    dispatch(removeShow({ showId: show.id }))
    navigate('/episode/shows', { replace: true })
  }

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <BackLink to='/episode/shows'>
          {t.source.shows}
        </BackLink>
        <h1 className={styles.title}>{show.title}</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.actions}>
          <Button variant='primary' fullWidth onClick={() => navigate(`/episode/shows/${show.id}/seasons/new`)}>{t.source.addSeason}</Button>
          <Button variant='secondary' fullWidth onClick={() => setIsDeleteDialogOpen(true)}>{t.source.deleteShow}</Button>
        </div>
        <div className={styles.listPanel}>
          <p className={styles.listLabel}>{t.source.seasons}</p>
          <ul className={styles.seasonList}>
            {show.seasons.map((season) => {
              return (
                <li key={season.id} className={styles.seasonItem}>
                  <Surface className={styles.seasonCard}>
                    <h2 className={styles.seasonTitle}>
                      {t.source.season.replace('{number}', String(season.number))}
                    </h2>
                    <p className={styles.seasonMeta}>
                      {t.source.episodesImported.replace(
                        '{count}',
                        String(season.episodes.length),
                      )}
                    </p>
                  </Surface>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title={t.source.deleteShowTitle}
        body={t.source.deleteShowBody}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </section>
  )
}