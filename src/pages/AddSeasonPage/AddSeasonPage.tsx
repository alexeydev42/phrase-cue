import { useState, type SubmitEventHandler } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useTranslation } from '../../i18n/useTranslation'
import { Input } from '../../components/Input/Input'
import { Button } from '../../components/Button/Button'
import { addSeason, selectShows } from '../../features/source/sourceSlice'
import { BackLink } from '../../components/BackLink/BackLink'

import styles from './AddSeasonPage.module.css'


export const AddSeasonPage = () => {
  const [seasonNumber, setSeasonNumber] = useState('')
  const t = useTranslation()
  const { showId } = useParams()
  const shows = useAppSelector(selectShows)
  const show = shows.find((show) => show.id === showId)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()


  const handleSave: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (!show) return
    const parsedSeasonNumber = Number(seasonNumber)
    if (!Number.isInteger(parsedSeasonNumber) || parsedSeasonNumber < 1) return
    const seasonId = crypto.randomUUID()

    dispatch(addSeason({
      showId: show.id,
      season: {
        id: seasonId,
        number: parsedSeasonNumber,
        episodes: []
      }
    }))
    navigate(`/episode/shows/${show.id}`, { replace: true })
  }
  if (!show) {
    return <p>{t.source.showNotFound}</p>
  }
  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <BackLink to={`/episode/shows/${show.id}`}>
          {show.title}
        </BackLink>
        <h1 className={styles.title}>{t.source.addSeason}</h1>
      </div>
      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor='season-number'>{t.source.seasonNumber}</label>
          <Input
            type='number'
            id='season-number'
            min={1}
            step={1}
            required
            value={seasonNumber}
            placeholder={t.source.seasonNumberPlaceholder}
            onChange={(event) => setSeasonNumber(event.target.value)}
          />
        </div>
        <Button type='submit' variant='primary' fullWidth>{t.source.saveSeason}</Button>
        <Button
          type='button'
          variant='secondary'
          onClick={() => navigate(`/episode/shows/${show.id}`, { replace: true })}
          fullWidth
        >
          {t.common.cancel}
        </Button>
      </form>
    </section>
  )
}