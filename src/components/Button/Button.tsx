import clsx from 'clsx'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import styles from './Button.module.css'

type ButtonProps = {
  variant: 'primary' | 'secondary' | 'danger'
  loading?: boolean;
  loadingLabel?: ReactNode;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className'>

export const Button = ({
  variant,
  children,
  type = 'button',
  loading = false,
  loadingLabel,
  disabled,
  ...buttonProps
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        styles.button,
        styles[variant],
        loading && styles.loading,
      )}
      {...buttonProps}
    >
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden='true' />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  )
}
