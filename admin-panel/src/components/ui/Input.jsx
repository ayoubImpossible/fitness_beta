import React from 'react'
import styles from './Input.module.css'

export function Input({ label, error, ...props }) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.input} ${error ? styles.hasError : ''}`} {...props} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label}>{label}</label>}
      <select className={`${styles.input} ${error ? styles.hasError : ''}`} {...props}>
        {children}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, ...props }) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea className={`${styles.input} ${styles.textarea} ${error ? styles.hasError : ''}`} {...props} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export function FileInput({ label, accept, onChange, preview }) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label}>{label}</label>}
      <label className={styles.fileLabel}>
        <input type="file" accept={accept} onChange={onChange} className={styles.fileHidden} />
        <span>📎 Choose file</span>
      </label>
      {preview && (
        <img src={preview} alt="preview" className={styles.preview} />
      )}
    </div>
  )
}
