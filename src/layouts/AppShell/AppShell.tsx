import { Outlet } from 'react-router'
import { MobileNavigation } from '../../components/Navigation/MobileNavigation'
import { Header } from '../../components/Header/Header'

import styles from './AppShell.module.css'

export const AppShell = () => {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <MobileNavigation />
    </div>
  )
}
