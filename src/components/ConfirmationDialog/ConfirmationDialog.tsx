import { useEffect, useId, useRef } from 'react'
import type {
  KeyboardEvent,
  MouseEvent,
  SyntheticEvent,
} from 'react'

import { Button } from '../Button/Button'
import styles from './ConfirmationDialog.module.css'

type ConfirmationDialogProps = {
  isOpen: boolean
  title: string
  body: string
  confirmVariant?: 'primary' | 'danger'
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmationDialog = ({
  isOpen,
  title,
  body,
  confirmVariant = 'danger',
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const titleId = useId()
  const bodyId = useId()

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (isOpen && !dialog.open) {
      dialog.showModal()
      cancelButtonRef.current?.focus()
    }

    if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onCancel()
    }
  }

  const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    onCancel()
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const confirmButton = confirmButtonRef.current
    const cancelButton = cancelButtonRef.current

    if (event.key !== 'Tab' || !confirmButton || !cancelButton) {
      return
    }

    if (event.shiftKey && document.activeElement === confirmButton) {
      event.preventDefault()
      cancelButton.focus()
    }

    if (!event.shiftKey && document.activeElement === cancelButton) {
      event.preventDefault()
      confirmButton.focus()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleDialogClick}
      onCancel={handleDialogCancel}
      onKeyDown={handleDialogKeyDown}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      <div className={styles.dialogContent}>
        <div className={styles.dialogText}>
          <h2 id={titleId} className={styles.dialogTitle}>
            {title}
          </h2>

          <p id={bodyId} className={styles.dialogDescription}>
            {body}
          </p>
        </div>

        <div className={styles.dialogActions}>
          <Button ref={confirmButtonRef} onClick={onConfirm} variant={confirmVariant} fullWidth>
            {confirmLabel}
          </Button>

          <Button ref={cancelButtonRef} variant='secondary' fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}