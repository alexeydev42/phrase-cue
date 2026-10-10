import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAppDispatch } from '../../app/hooks'
import { useTranslation } from '../../i18n/useTranslation'
import { Input } from '../../components/Input/Input'
import { Button } from '../../components/Button/Button'
import { addSeason } from '../../features/source/sourceSlice'

export const AddSeasonPage = () => {
  const [seasonNumber, setSeasonNumber] = useState('')
  const t = useTranslation()
  const { showId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSave = () => {
    if (!showId) return
    const parsedSeasonNumber = Number(seasonNumber)
    if (!Number.isInteger(parsedSeasonNumber) || parsedSeasonNumber < 1) return
    const seasonId = crypto.randomUUID()

    dispatch(addSeason({
      showId,
      season: {
        id: seasonId,
        number: parsedSeasonNumber,
        episodes: []
      }
    }))
    navigate(`/episode/shows/${showId}`, { replace: true })
  }

  return (
    <section>
      <h1>{t.source.addSeason}</h1>
      <label htmlFor='season-number'>{t.source.seasonNumber}</label>
      <Input type='number' id='season-number' value={seasonNumber} placeholder={t.source.seasonNumberPlaceholder} onChange={(event) => setSeasonNumber(event.target.value)} />
      <Button variant='primary' onClick={handleSave}>{t.source.saveSeason}</Button>
    </section>
  )
}