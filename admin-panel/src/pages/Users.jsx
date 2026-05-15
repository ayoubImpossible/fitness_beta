import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import { Table, Th, Td, Tr, EmptyRow } from '../components/ui/Table'
import Spinner from '../components/ui/Spinner'
import api from '../api/axios'
import styles from './Users.module.css'

export default function Users() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/users')
      .then(res => {
        const data = res.data?.data || []
        setUsers(data)
        setFiltered(data)
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (val) => {
    setSearch(val)
    const q = val.toLowerCase()
    setFiltered(users.filter(u =>
      (u.email || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q)
    ))
  }

  const display = search ? filtered : users

  return (
    <div>
      <PageHeader title="Users" subtitle={`${users.length} registered users`} />

      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search by email or name..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        {loading ? <Spinner /> : (
          <Table>
            <thead>
              <tr>
                <Th>Avatar</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Provider</Th>
                <Th>Joined</Th>
              </tr>
            </thead>
            <tbody>
              {display.length === 0
                ? <EmptyRow cols={5} message="No users found" />
                : display.map(u => (
                  <Tr key={u.uid}>
                    <Td>
                      {u.photoURL
                        ? <img src={u.photoURL} alt={u.displayName} className={styles.avatar} />
                        : <div className={styles.avatarFallback}>{(u.displayName || u.email || '?')[0].toUpperCase()}</div>
                      }
                    </Td>
                    <Td><span className={styles.name}>{u.displayName || u.fullName || '—'}</span></Td>
                    <Td><span className={styles.email}>{u.email}</span></Td>
                    <Td><span className={styles.badge}>{u.provider || 'email'}</span></Td>
                    <Td><span className={styles.muted}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span></Td>
                  </Tr>
                ))
              }
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
