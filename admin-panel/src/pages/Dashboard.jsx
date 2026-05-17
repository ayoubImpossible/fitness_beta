import React, { useEffect, useState } from 'react'
import { Tag, FolderOpen, Video, ClipboardList, Users } from 'lucide-react'
import { StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import { getTypes } from '../api/types'
import { getAllCategories } from '../api/categories'
import { getPrograms } from '../api/programs'
import { getAdminStats } from '../api/admin'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getTypes(),
      getAllCategories(),
      getPrograms(),
      getAdminStats()
    ]).then(([types, cats, programs, adminStats]) => {
      setStats({
        types: types.value?.data?.length ?? 0,
        categories: cats.value?.data?.length ?? 0,
        programs: programs.value?.data?.data?.length ?? 0,
        totalUsers: adminStats.value?.data?.data?.totalUsers ?? 0,
        activeGrowth: adminStats.value?.data?.data?.activeGrowth ?? [],
        topPrograms: adminStats.value?.data?.data?.topPrograms ?? [],
        topVideos: adminStats.value?.data?.data?.topVideos ?? []
      })
      setLoading(false)
    })
  }, [])

  const UserActivityChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.count), 5);
    
    // Generate smooth path data
    const getPathData = (isArea = false) => {
      const points = data.map((d, i) => ({
        x: (i * 100) / (data.length - 1),
        y: 100 - (d.count * 100) / max
      }));
      
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cp1x = curr.x + (next.x - curr.x) / 2;
        d += ` C ${cp1x} ${curr.y}, ${cp1x} ${next.y}, ${next.x} ${next.y}`;
      }
      
      if (isArea) {
        d += ` L 100 100 L 0 100 Z`;
      }
      return d;
    };

    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Community Growth</h3>
          <span className={styles.chartSubtitle}>New users in last 7 days</span>
        </div>
        <div className={styles.chartContainer}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.svg}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Background Grid */}
            {[25, 50, 75].map(v => (
              <line key={v} x1="0" y1={v} x2="100" y2={v} className={styles.gridLine} />
            ))}

            <path d={getPathData(true)} fill="url(#areaGrad)" stroke="none" />
            <path d={getPathData(false)} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" className={styles.glowLine} />
            
            {/* Points */}
            {data.map((d, i) => {
              const x = (i * 100) / (data.length - 1);
              const y = 100 - (d.count * 100) / max;
              return <circle key={i} cx={x} cy={y} r="1.5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="0.5" />;
            })}
          </svg>
          <div className={styles.labels}>
            {data.map((d, i) => (
              <div key={i} className={styles.label}>
                <span className={styles.labelCount}>{d.count}</span>
                <span className={styles.labelDate}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your Fitness Admin Panel"
      />

      {!stats ? <Spinner /> : (
        <>
          <div className={styles.grid}>
            <StatCard label="Total Users"  value={stats.totalUsers} icon={<Users size={22} />}        color="#38bdf8" />
            <StatCard label="Sport Types"  value={stats.types}      icon={<Tag size={22} />}          color="#c084fc" />
            <StatCard label="Categories"   value={stats.categories} icon={<FolderOpen size={22} />}   color="#e879f9" />
            <StatCard label="Programs"     value={stats.programs}   icon={<ClipboardList size={22} />} color="#818cf8" />
          </div>

          <div className={styles.analyticsRow}>
            <UserActivityChart data={stats.activeGrowth} />
            
            <div className={styles.topSection}>
              <div className={styles.topCard}>
                <h3 className={styles.chartTitle}>Most Liked Programs</h3>
                <div className={styles.topList}>
                  {stats.topPrograms.map((p, i) => (
                    <div key={p.id} className={styles.topItem}>
                      <span className={styles.rank}>{i+1}</span>
                      <div className={styles.topInfo}>
                        <span className={styles.topName}>{p.name}</span>
                        <span className={styles.topMeta}>{p.likes} likes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.topCard}>
                <h3 className={styles.chartTitle}>Most Played Videos</h3>
                <div className={styles.topList}>
                  {stats.topVideos.map((v, i) => (
                    <div key={v.id} className={styles.topItem}>
                      <img src={v.image} alt="" className={styles.topThumb} />
                      <div className={styles.topInfo}>
                        <span className={styles.topName}>{v.titre}</span>
                        <span className={styles.topMeta}>{v.saves} plays</span>
                      </div>
                      <span className={styles.rankSmall}>#{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actions}>
          {[
            { label: '+ Add Type',     to: '/types' },
            { label: '+ Add Category', to: '/categories' },
            { label: '+ Add Program',  to: '/programs' },
          ].map(({ label, to }) => (
            <a key={to} href={to} className={styles.actionBtn}>{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
