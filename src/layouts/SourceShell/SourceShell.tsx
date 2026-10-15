import { Outlet } from 'react-router'
import { Header } from '../../components/Header/Header'

export const SourceShell = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  )
}
