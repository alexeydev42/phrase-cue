import { NavLink, useLocation } from 'react-router'
import { useTranslation } from '../../i18n/useTranslation'
import clsx from 'clsx'

import styles from './DesktopNavigation.module.css'

export const DesktopNavigation = () => {
  const { pathname } = useLocation()
  const t = useTranslation()

  return (
    <nav className={styles.navigation}>
      <NavLink
        to='/'
        end
        className={({ isActive }) =>
          clsx(styles.link, (isActive || pathname.startsWith('/episode/')) && styles.linkActive)
        }
      >
        {t.navigation.episode}
      </NavLink>
      <NavLink
        to='/library'
        className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
      >
        {t.navigation.library}
      </NavLink>
      <NavLink
        to='/study'
        className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
      >
        {t.navigation.study}
      </NavLink>
      <NavLink
        to='/settings'
        className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
      >
        {t.navigation.settings}
      </NavLink>
    </nav>
  )
}
