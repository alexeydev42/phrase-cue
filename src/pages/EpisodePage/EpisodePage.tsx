
import { useTranslation } from '../../i18n/useTranslation'
import styles from './EpisodePage.module.css'

export const EpisodePage = () => {
  const t = useTranslation()

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>PhraseCue</h1>
        <p className={styles.status}>{t.episode.underDevelopment}</p>
        <p className={styles.description}>
          {t.episode.underDevelopmentHint}
        </p>
      </div>
    </section>
  )
}
