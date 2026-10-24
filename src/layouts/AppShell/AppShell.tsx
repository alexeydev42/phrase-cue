import { Outlet } from 'react-router'
import { MobileNavigation } from '../../components/Navigation/MobileNavigation'
import { Header } from '../../components/Header/Header'
import { AuthorFooter } from '../../components/AuthorFooter/AuthorFooter'

import styles from './AppShell.module.css'

export const AppShell = () => {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <MobileNavigation />
      <AuthorFooter />
    </div>
  )
}
