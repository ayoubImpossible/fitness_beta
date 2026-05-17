import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Tag, FolderOpen, Dumbbell,
  Video, ClipboardList, Users, ChevronRight, Zap
} from 'lucide-react'
import styles from './Layout.module.css'

const NAV = [
  { label: 'Dashboard',  to: '/',          icon: LayoutDashboard, section: 'Overview' },
  { label: 'Types',      to: '/types',      icon: Tag,             section: 'Content' },
  { label: 'Categories', to: '/categories', icon: FolderOpen,      section: 'Content' },
  { label: 'Videos',     to: '/videos',     icon: Video,           section: 'Content' },
  { label: 'Programs',   to: '/programs',   icon: ClipboardList,   section: 'Programs' },
  { label: 'Users',      to: '/users',      icon: Users,           section: 'Users' },
]

const sections = [...new Set(NAV.map(n => n.section))]

export default function Layout() {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Zap className={styles.zapIcon} size={20} fill="white" />
          <span className={styles.logoText}>FitnessAdmin</span>
        </div>

        <nav className={styles.nav}>
          {sections.map(section => (
            <div key={section}>
              <p className={styles.sectionLabel}>{section}</p>
              {NAV.filter(n => n.section === section).map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  <ChevronRight size={14} className={styles.chevron} />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
