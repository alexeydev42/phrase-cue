import { useRef, useState } from 'react'
import { ConfirmationDialog } from '../../components/ConfirmationDialog/ConfirmationDialog'
import { parseBackupJson, type PhraseCueBackup } from '../../features/backup/backup'
import { exportBackup, restoreBackup } from '../../features/backup/backupThunks'
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

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isExporting, setIsExporting] = useState(false)
  const [isReadingBackup, setIsReadingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const [selectedBackup, setSelectedBackup] = useState<PhraseCueBackup | null>(null)
  const [backupError, setBackupError] = useState<'invalid' | 'create' | null>(null)
  const [restoreError, setRestoreError] = useState(false)

  const isBackupBusy = isExporting || isReadingBackup || isRestoring

  const parsedLimit = Number(limitInput)
  const isValidLimit = limitInput.trim() !== '' && isValidLearningLimit(parsedLimit)
  const isBelowLearningCount = isValidLimit && parsedLimit < learningCount
  const hasChanges = parsedLimit !== learningLimit
  const canSave = isValidLimit && !isBelowLearningCount && hasChanges && !isSaving && !isRestoring

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

  const handleCreateBackup = async () => {
    setIsExporting(true)
    setBackupError(null)

    try {
      const json = await dispatch(exportBackup())

      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      try {
        link.href = url
        link.download = `phrase-cue-backup-${new Date().toISOString().slice(0, 10)}.json`

        document.body.appendChild(link)
        link.click()
      } finally {
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch {
      setBackupError('create')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSelectedBackup = async (file: File) => {
    setIsReadingBackup(true)
    setBackupError(null)
    setRestoreError(false)

    try {
      const content = await file.text()
      const backup = parseBackupJson(content)

      if (!backup) {
        setBackupError('invalid')
        return
      }

      setSelectedBackup(backup)
    } catch {
      setBackupError('invalid')
    } finally {
      setIsReadingBackup(false)
    }
  }

  const handleConfirmRestore = async () => {
    if (!selectedBackup || isRestoring) return

    setIsRestoring(true)
    setRestoreError(false)

    try {
      await dispatch(restoreBackup(selectedBackup))

      setLimitInput(String(selectedBackup.settings.learningLimit))
      setSelectedBackup(null)
    } catch {
      setRestoreError(true)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleCancelRestore = () => {
    if (isRestoring) return

    setSelectedBackup(null)
    setRestoreError(false)
  }

  const hasInvalidInput = limitInput !== '' && !isValidLimit
  const hasLimitError = hasInvalidInput || isBelowLearningCount

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t.settings.title}</h1>
        <p className={styles.subtitle}>{t.settings.subtitle}</p>
      </div>

      {backupError === 'invalid' && (
        <div className={styles.backupAlert} role='alert'>
          <p className={styles.backupAlertTitle}>{t.backup.invalidFile}</p>
          <p className={styles.hint}>{t.backup.nothingChanged}</p>
        </div>
      )}

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
                  disabled={isSaving || isRestoring}
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
              <Button
                variant='primary'
                fullWidth
                loading={isExporting}
                disabled={isBackupBusy || isSaving}
                onClick={() => void handleCreateBackup()}
              >
                {t.backup.create}
              </Button>

              <Button
                variant='secondary'
                fullWidth
                loading={isReadingBackup}
                disabled={isBackupBusy || isSaving}
                onClick={() => fileInputRef.current?.click()}
              >
                {t.backup.restore}
              </Button>

              <input
                ref={fileInputRef}
                type='file'
                accept='.json,application/json'
                hidden
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0]
                  event.currentTarget.value = ''

                  if (file) {
                    void handleSelectedBackup(file)
                  }
                }}
              />
            </div>

            {backupError === 'create' && (
              <p className={styles.error} role='alert'>
                {t.backup.createFailed}
              </p>
            )}
          </section>

          <section className={styles.storedLocallyPanel}>
            <h2 className={styles.panelTitle}>{t.settings.storedLocally}</h2>
            <p className={styles.hint}>{t.settings.storedLocallyHint}</p>
          </section>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={selectedBackup !== null}
        title={t.backup.restoreTitle}
        body={t.backup.restoreBody}
        confirmLabel={t.backup.restoreAction}
        cancelLabel={t.common.cancel}
        confirmVariant='danger'
        loading={isRestoring}
        error={restoreError ? t.backup.restoreFailed : null}
        onConfirm={() => void handleConfirmRestore()}
        onCancel={handleCancelRestore}
      />
    </section>
  )
}
