import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '../../app/hooks'
import { useTranslation } from '../../i18n/useTranslation'
import { Input } from '../../components/Input/Input'
import { Button } from '../../components/Button/Button'
import { addShow } from '../../features/source/sourceSlice'

export const AddShowPage = () => {
  const [title, setTitle] = useState('')
  const t = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSave = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const showId = crypto.randomUUID()

    dispatch(addShow({
      id: showId,
      title: trimmedTitle,
      seasons: []
    }))
    navigate(`/episode/shows/${showId}`, { replace: true })
  }

  return (
    <section>
      <h1>{t.source.addShow}</h1>
      <label htmlFor='show-title'>{t.source.showTitle}</label>
      <Input id='show-title' value={title} placeholder={t.source.showTitlePlaceholder} onChange={(event) => setTitle(event.target.value)} />
      <Button variant='primary' onClick={handleSave}>{t.source.saveShow}</Button>
    </section>
  )
}