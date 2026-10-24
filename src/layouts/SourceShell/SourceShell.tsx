import { Outlet } from 'react-router'
import { Header } from '../../components/Header/Header'
import { AuthorFooter } from '../../components/AuthorFooter/AuthorFooter'

import styles from './SourceShell.module.css'

export const SourceShell = () => {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <AuthorFooter />
    </div>
  )
}
