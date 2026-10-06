import { Link } from 'react-router'
import { DesktopNavigation } from '../Navigation/DesktopNavigation'
import Logo from '../../assets/icons/logo.svg?react'

import styles from './Header.module.css'

export const Header = () => {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} to='/'>
        <Logo className={styles.logo} />
        <span className={styles.brandName}>PhraseCue</span>
      </Link>

      <DesktopNavigation />
    </header>
  )
}