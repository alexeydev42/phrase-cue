import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectTheme, setTheme } from '../../features/settings/settingsSlice'

export const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  return (
    <>
      <button type='button' onClick={() => dispatch(setTheme('system'))}>
        System
      </button>

      <button type='button' onClick={() => dispatch(setTheme('light'))}>
        Light
      </button>

      <button type='button' onClick={() => dispatch(setTheme('dark'))}>
        Dark
      </button>

      <p>Current theme: {theme}</p>
    </>
  )
}
