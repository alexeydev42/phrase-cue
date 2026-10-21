import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Button } from '../../components/Button/Button'
import { selectPhrasesByStatus } from '../../features/phrase/phraseSlice'
import { isValidLearningLimit } from '../../features/settings/learningLimitValidation'
import { saveLanguage, saveTheme } from '../../features/settings/settingsPreferencesStorage'
import {
  selectLanguage,
  selectLearningLimit,
  selectTheme,
  setLanguage,
  setTheme,
} from '../../features/settings/settingsSlice'
import type { Language, Theme } from '../../features/settings/settingsSlice'
import { updateLearningLimit } from '../../features/settings/settingsThunks'
import { useTranslation } from '../../i18n/useTranslation'

import styles from './SettingsPage.module.css'

export const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const t = useTranslation()

  const language = useAppSelector(selectLanguage)
  const theme = useAppSelector(selectTheme)
  const learningLimit = useAppSelector(selectLearningLimit)
  const learningCount = useAppSelector((state) => selectPhrasesByStatus(state, 'learning').length)

  const [limitInput, setLimitInput] = useState(String(learningLimit))
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const parsedLimit = Number(limitInput)
  const isValidLimit = limitInput.trim() !== '' && isValidLearningLimit(parsedLimit)
  const isBelowLearningCount = isValidLimit && parsedLimit < learningCount
  const hasChanges = parsedLimit !== learningLimit
  const canSave = isValidLimit && !isBelowLearningCount && hasChanges && !isSaving

  const handleSave = async () => {
    if (!canSave) return

    setIsSaving(true)
    setSaveError(false)

    try {
      await dispatch(updateLearningLimit(parsedLimit))
    } catch {
      setSaveError(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    saveLanguage(newLanguage)
    dispatch(setLanguage(newLanguage))
  }

  const handleThemeChange = (newTheme: Theme) => {
    saveTheme(newTheme)
    dispatch(setTheme(newTheme))
  }

  const hasInvalidInput = limitInput !== '' && !isValidLimit
  const hasLimitError = hasInvalidInput || isBelowLearningCount

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t.settings.title}</h1>
        <p className={styles.subtitle}>{t.settings.subtitle}</p>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.settingsMain}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.settings.interfaceSection}</h2>

            <div className={styles.panel}>
              <div className={styles.field}>
                <p className={styles.label} id='language-label'>
                  {t.settings.language}
                </p>

                <div className={styles.options} role='group' aria-labelledby='language-label'>
                  <button
                    type='button'
                    className={styles.optionButton}
                    aria-pressed={language === 'en'}
                    onClick={() => handleLanguageChange('en')}
                  >
                    {t.settings.languageEnglish}
                  </button>

                  <button
                    type='button'
                    className={styles.optionButton}
                    aria-pressed={language === 'ru'}
                    onClick={() => handleLanguageChange('ru')}
                  >
                    {t.settings.languageRussian}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <p className={styles.label} id='theme-label'>
                  {t.settings.theme}
                </p>

                <div className={styles.options} role='group' aria-labelledby='theme-label'>
                  <button
                    type='button'
                    className={styles.optionButton}
                    aria-pressed={theme === 'system'}
                    onClick={() => handleThemeChange('system')}
                  >
                    {t.settings.themeSystem}
                  </button>

                  <button
                    type='button'
                    className={styles.optionButton}
                    aria-pressed={theme === 'light'}
                    onClick={() => handleThemeChange('light')}
                  >
                    {t.settings.themeLight}
                  </button>

                  <button
                    type='button'
                    className={styles.optionButton}
                    aria-pressed={theme === 'dark'}
                    onClick={() => handleThemeChange('dark')}
                  >
                    {t.settings.themeDark}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.settings.learningSection}</h2>

            <form
              className={styles.learningForm}
              onSubmit={(event) => {
                event.preventDefault()
                void handleSave()
              }}
            >
              <div className={styles.learningPanel}>
                <label className={styles.label} htmlFor='learning-limit'>
                  {t.settings.learningLimit}
                </label>

                {hasInvalidInput && (
                  <p className={styles.error} role='alert'>
                    {t.settings.learningLimitInvalid}
                  </p>
                )}

                {isBelowLearningCount && (
                  <p className={styles.error} role='alert'>
                    {t.settings.learningLimitError.replace('{count}', String(learningCount))}
                  </p>
                )}

                {!hasLimitError && (
                  <p className={styles.hint} id='learning-limit-hint'>
                    {t.settings.learningLimitHint.replace('{count}', String(learningCount))}
                  </p>
                )}

                <input
                  id='learning-limit'
                  className={styles.input}
                  type='number'
                  min={1}
                  max={50}
                  step={1}
                  value={limitInput}
                  disabled={isSaving}
                  aria-invalid={hasLimitError}
                  aria-describedby={!hasLimitError ? 'learning-limit-hint' : undefined}
                  onChange={(event) => {
                    setLimitInput(event.target.value)
                    setSaveError(false)
                  }}
                />

                {saveError && (
                  <p className={styles.error} role='alert'>
                    {t.settings.saveFailed}
                  </p>
                )}
              </div>

              <Button
                variant='primary'
                type='submit'
                fullWidth
                loading={isSaving}
                disabled={!canSave}
              >
                {t.common.save}
              </Button>
            </form>
          </section>
        </div>

        <div className={styles.settingsAside}>
          <section className={styles.localDataPanel}>
            <h2 className={styles.panelTitle}>{t.settings.localData}</h2>
            <p className={styles.hint}>{t.settings.localDataDescription}</p>

            <div className={styles.backupActions}>
              <Button variant='primary' fullWidth disabled>
                {t.backup.create}
              </Button>

              <Button variant='secondary' fullWidth disabled>
                {t.backup.restore}
              </Button>
            </div>
          </section>

          <section className={styles.storedLocallyPanel}>
            <h2 className={styles.panelTitle}>{t.settings.storedLocally}</h2>
            <p className={styles.hint}>{t.settings.storedLocallyHint}</p>
          </section>
        </div>
      </div>
    </section>
  )
}
