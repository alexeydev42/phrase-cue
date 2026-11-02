import { useEffect } from 'react'
import { useAppSelector } from '../../app/hooks'
import { selectTheme } from './settingsSlice'

export const ThemeSync = () => {
  const theme = useAppSelector(selectTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')

    const updateThemeColor = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches)

      meta?.setAttribute('content', isDark ? '#17212b' : '#f5f7fa')
    }

    updateThemeColor()

    mediaQuery.addEventListener('change', updateThemeColor)

    return () => {
      mediaQuery.removeEventListener('change', updateThemeColor)
    }
  }, [theme])

  return null
}
