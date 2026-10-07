import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectTheme, setTheme, setLanguage } from '../../features/settings/settingsSlice'
import { useTranslation } from '../../i18n/useTranslation'
import { Button } from '../../components/Button/Button'

export const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const t = useTranslation()
  return (
    <>
      <Button variant='primary'onClick={() => dispatch(setTheme('system'))}>
        {t.settings.themeSystem}
      </Button>

      <Button variant='secondary'onClick={() => dispatch(setTheme('light'))}>
        {t.settings.themeLight}
      </Button>

      <Button variant='secondary'onClick={() => dispatch(setTheme('dark'))}>
        {t.settings.themeDark}
      </Button>

      <Button variant='primary' onClick={() => dispatch(setLanguage('en'))}>
        {t.settings.languageEnglish}
      </Button>

      <Button variant='primary'onClick={() => dispatch(setLanguage('ru'))}>
        {t.settings.languageRussian}
      </Button>
      <p>Current theme: {theme}</p>
      
      <Button variant='primary' loading>
        {t.selectPhrase.translating}
      </Button>
    </>
  )
}
