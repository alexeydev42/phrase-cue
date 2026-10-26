import { Outlet, useLocation } from 'react-router'
import clsx from 'clsx'
import { MobileNavigation } from '../../components/Navigation/MobileNavigation'
import { Header } from '../../components/Header/Header'
import { AuthorFooter } from '../../components/AuthorFooter/AuthorFooter'

import styles from './AppShell.module.css'

export const AppShell = () => {
  const { pathname } = useLocation()

  const isEpisodePage = pathname === '/'

  return (
    <div className={clsx(styles.shell, isEpisodePage && styles.shellEpisode)}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <MobileNavigation />
      <AuthorFooter />
    </div>
  )
}
