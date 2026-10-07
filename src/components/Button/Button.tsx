import clsx from 'clsx'
import type { ComponentPropsWithRef, ReactNode } from 'react'

import styles from './Button.module.css'

type ButtonProps = {
  variant: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
  loading?: boolean
  loadingLabel?: ReactNode
  children: ReactNode
} & Omit<ComponentPropsWithRef<'button'>, 'children'>

export const Button = ({
  variant,
  fullWidth,
  children,
  ref,
  className,
  type = 'button',
  loading = false,
  loadingLabel,
  disabled,
  ...buttonProps
}: ButtonProps) => {
  return (
    <button
      {...buttonProps}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={clsx(
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
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
