import { useState, type SubmitEventHandler } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '../../app/hooks'
import { useTranslation } from '../../i18n/useTranslation'
import { Input } from '../../components/Input/Input'
import { Button } from '../../components/Button/Button'
import { addShow } from '../../features/source/sourceSlice'
import { BackLink } from '../../components/BackLink/BackLink'

import styles from './AddShowPage.module.css'


export const AddShowPage = () => {
  const [title, setTitle] = useState('')
  const t = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSave: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
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
    <section className={styles.page}>
      <div className={styles.head}>
        <BackLink to='/episode/shows'>{t.source.shows}</BackLink>
        <h1 className={styles.title}>{t.source.addShow}</h1>
      </div>

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor='show-title'>
            {t.source.showTitle}
          </label>
          <Input
            id='show-title'
            value={title}
            placeholder={t.source.showTitlePlaceholder}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <Button type='submit' variant='primary' fullWidth>
          {t.source.saveShow}
        </Button>

        <Button
          type='button'
          variant='secondary'
          onClick={() => navigate('/episode/shows', { replace: true })}
          fullWidth
        >
          {t.common.cancel}
        </Button>
      </form>
    </section>
  )
}