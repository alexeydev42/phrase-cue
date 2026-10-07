import { useAppDispatch } from '../../app/hooks'
import {
  setTheme,
  setLanguage,
} from '../../features/settings/settingsSlice'
import { useTranslation } from '../../i18n/useTranslation'
import { Button } from '../../components/Button/Button'

export const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const t = useTranslation()
  return (
    <>
      <Button variant='primary' onClick={() => dispatch(setTheme('system'))}>
        {t.settings.themeSystem}
      </Button>

      <Button variant='primary' onClick={() => dispatch(setTheme('light'))}>
        {t.settings.themeLight}
      </Button>

      <Button variant='primary' onClick={() => dispatch(setTheme('dark'))}>
        {t.settings.themeDark}
      </Button>

      <Button variant='primary' onClick={() => dispatch(setLanguage('en'))}>
        {t.settings.languageEnglish}
      </Button>

      <Button variant='primary' onClick={() => dispatch(setLanguage('ru'))}>
        {t.settings.languageRussian}
      </Button>
    </>
  )
}
