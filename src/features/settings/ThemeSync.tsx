import { useEffect } from 'react'
import { useAppSelector } from '../../app/hooks'
import { selectTheme } from './settingsSlice'

export const ThemeSync = () => {
  const theme = useAppSelector(selectTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return null
}
