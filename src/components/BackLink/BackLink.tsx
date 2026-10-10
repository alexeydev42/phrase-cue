import type { ReactNode } from 'react'
import { Link } from 'react-router'

import styles from './BackLink.module.css'

type BackLinkProps = {
  to: string
  children: ReactNode
}

export const BackLink = ({ to, children }: BackLinkProps) => {
  return (
    <Link to={to} className={styles.backLink}>
      <span className={styles.backArrow} aria-hidden='true'>
        ←
      </span>
      {children}
    </Link>
  )
}