import clsx from 'clsx'
import type { ComponentPropsWithoutRef } from 'react'

import styles from './Input.module.css'

type InputProps = {
  variant?: 'default' | 'time';
} & Omit<ComponentPropsWithoutRef<'input'>, 'className'>

export const Input = ({ variant = 'default', ...inputProps }: InputProps) => {
  return (
    <input
      {...inputProps}
      className={clsx(styles.input, variant === 'time' && styles.time)}
    />
  )
}
