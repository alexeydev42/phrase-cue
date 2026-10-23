import { NavLink } from 'react-router'
import clsx from 'clsx'
import { useTranslation } from '../../i18n/useTranslation'

import styles from './MobileNavigation.module.css'

export const MobileNavigation = () => {
  const t = useTranslation()

  const items = [
    { to: '/', label: t.navigation.episode, end: true },
    { to: '/library', label: t.navigation.library },
    { to: '/study', label: t.navigation.study },
    { to: '/settings', label: t.navigation.settings },
  ]

  return (
    <nav className={styles.navigation}>
      {items.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
        >
          <span className={styles.indicator} aria-hidden='true' />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
