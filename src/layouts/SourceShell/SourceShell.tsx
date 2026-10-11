import { Outlet } from 'react-router'
import { Header } from '../../components/Header/Header'

import styles from './SourceShell.module.css'

export const SourceShell = () => {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}
