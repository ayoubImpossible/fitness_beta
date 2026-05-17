import React from 'react'
import styles from './Card.module.css'

export default function Card({ children, className = '' }) {
  return <div className={`${styles.card} ${className}`}>{children}</div>
}

export function StatCard({ label, value, icon, color = 'var(--accent)' }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statIcon} style={{ background: `${color}18`, color }}>{icon}</div>
      <div>
        <p className={styles.statValue}>{value ?? '—'}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  )
}
