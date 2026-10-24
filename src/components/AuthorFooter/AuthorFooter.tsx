import { useTranslation } from '../../i18n/useTranslation'

import styles from './AuthorFooter.module.css'

export const AuthorFooter = () => {
  const t = useTranslation()

  return (
    <footer className={styles.footer}>
      <span>{t.settings.developedBy}</span>
      <a
        className={styles.link}
        href='https://alexeydev42.com/'
        target='_blank'
        rel='noopener noreferrer'
      >
        {t.settings.authorName}
      </a>
    </footer>
  )
}
