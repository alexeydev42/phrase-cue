import { useAppSelector } from '../app/hooks'
import { selectLanguage } from '../features/settings/settingsSlice'
import { translations } from './translations'

export const useTranslation = () => {
  const language = useAppSelector(selectLanguage)

  return translations[language]
}

