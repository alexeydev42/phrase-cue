import { useEffect } from 'react'
import { useAppSelector } from '../../app/hooks'
import { selectLanguage } from './settingsSlice'

export const LanguageSync = () => {
  const language = useAppSelector(selectLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return null
}
