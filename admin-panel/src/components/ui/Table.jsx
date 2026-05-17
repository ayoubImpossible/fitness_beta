import React from 'react'
import styles from './Table.module.css'

export function Table({ children }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>{children}</table>
    </div>
  )
}

export function Th({ children }) {
  return <th className={styles.th}>{children}</th>
}

export function Td({ children, center }) {
  return <td className={`${styles.td} ${center ? styles.center : ''}`}>{children}</td>
}

export function Tr({ children, onClick }) {
  return <tr className={`${styles.tr} ${onClick ? styles.clickable : ''}`} onClick={onClick}>{children}</tr>
}

export function EmptyRow({ cols, message = 'No data found' }) {
  return (
    <tr>
      <td colSpan={cols} className={styles.empty}>{message}</td>
    </tr>
  )
}
