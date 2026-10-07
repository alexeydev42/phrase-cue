import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectTheme, setTheme, setLanguage } from '../../features/settings/settingsSlice'
import { useTranslation } from '../../i18n/useTranslation'

export const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const t = useTranslation()
  return (
    <>
      <button type='button' onClick={() => dispatch(setTheme('system'))}>
        {t.settings.themeSystem}
      </button>

      <button type='button' onClick={() => dispatch(setTheme('light'))}>
        {t.settings.themeLight}
      </button>

      <button type='button' onClick={() => dispatch(setTheme('dark'))}>
        {t.settings.themeDark}
      </button>

      <button type='button' onClick={() => dispatch(setLanguage('en'))}>
        {t.settings.languageEnglish}
      </button>

      <button type='button' onClick={() => dispatch(setLanguage('ru'))}>
        {t.settings.languageRussian}
      </button>
      <p>Current theme: {theme}</p>
    </>
  )
}
