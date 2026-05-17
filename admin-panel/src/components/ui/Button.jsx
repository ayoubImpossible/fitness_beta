import React from 'react'
import styles from './Button.module.css'

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, icon, onClick, type = 'button', disabled, className = ''
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
    >
      {loading
        ? <span className={styles.spinner} />
        : icon && <span className={styles.icon}>{icon}</span>
      }
      {children}
    </button>
  )
}
