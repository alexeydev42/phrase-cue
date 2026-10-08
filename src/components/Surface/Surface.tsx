import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import clsx from 'clsx'
import styles from './Surface.module.css'

type SurfaceProps = {
  children: ReactNode
  variant?: 'default' | 'accent'
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>

export const Surface = ({ children, variant = 'default', className, ...surfaceProps }: SurfaceProps) => {
  return (
    <div className={clsx(styles.surface, variant === 'accent' && styles.accent, className)} {...surfaceProps}>{children}</div>
  )
}