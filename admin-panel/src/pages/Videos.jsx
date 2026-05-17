import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, Play, Edit, Trash2 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import { Table, Th, Td, Tr, EmptyRow } from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import api from '../api/axios'
import styles from './Videos.module.css'

export default function Videos() {
  const [videos, setVideos] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)

  const refreshVideos = () => {
    setLoading(true)
    api.get('/admin/videos')
      .then(res => {
        const data = res.data || []
        setVideos(data); setFiltered(data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshVideos()
  }, [])

  const handleDelete = async (v) => {
    if (!window.confirm(`Delete "${v.titre || v.name}"?`)) return
    try {
      await api.delete(`/admin/videos?path=${encodeURIComponent(v.path)}&id=${v.id}`)
      toast.success('Video deleted')
      refreshVideos()
    } catch { toast.error('Failed to delete') }
  }

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await api.put('/admin/videos', {
        path: editData.path,
        id: editData.id,
        data: {
          titre: editData.titre,
          name: editData.titre,
          difficulty: editData.difficulty,
          level: editData.difficulty,
          equipment: editData.equipment,
          material: editData.equipment,
          duration: parseInt(editData.duration)
        }
      })
      toast.success('Video updated')
      setEditData(null)
      refreshVideos()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleSearch = (val) => {
    setSearch(val)
    const q = val.toLowerCase()
    setFiltered(videos.filter(v =>
      (v.titre || v.name || v.title || '').toLowerCase().includes(q) ||
      (v.difficulty || v.level || '').toLowerCase().includes(q) ||
      (v.equipment || v.material || v.materiel || '').toLowerCase().includes(q)
    ))
  }

  return (
    <div>
      <PageHeader
        title="Videos"
        subtitle={`${filtered.length} of ${videos.length} videos`}
      />

      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search by name, difficulty, equipment..."
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
                <Th>Thumbnail</Th>
                <Th>Name</Th>
                <Th>Difficulty</Th>
                <Th>Equipment</Th>
                <Th>Duration</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <EmptyRow cols={6} message="No videos found" />
                : filtered.slice(0, 100).map(v => (
                  <Tr key={v.id}>
                    <Td>
                      {v.imageUrl
                        ? <img src={v.imageUrl} alt={v.titre || v.name} className={styles.thumb} />
                        : <div className={styles.noImg}>🎬</div>
                      }
                    </Td>
                    <Td>
                      <span className={styles.name}>
                        {v.titre || v.name || v.title || '—'}
                      </span>
                    </Td>
                    <Td>
                      {(v.difficulty || v.level)
                        ? <span className={`${styles.badge} ${styles[(v.difficulty || v.level)?.toLowerCase()]}`}>
                            {v.difficulty || v.level}
                          </span>
                        : <span className={styles.muted}>—</span>
                      }
                    </Td>
                    <Td>
                      <span className={styles.muted}>
                        {v.equipment || v.material || v.materiel || '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className={styles.muted}>
                        {v.duration || v.temps || '—'}{typeof v.duration === 'number' ? 's' : ''}
                      </span>
                    </Td>
                    <Td>
                      <div className={styles.actions}>
                        {v.videoUrl && (
                          <button className={styles.playBtn} title="Play" onClick={() => setSelected(v)}>
                            <Play size={13} />
                          </button>
                        )}
                        <button className={styles.editBtn} title="Edit" onClick={() => setEditData({
                          id: v.id,
                          path: v.path,
                          titre: v.titre || v.name,
                          difficulty: v.difficulty || v.level,
                          equipment: v.equipment || v.material,
                          duration: v.duration || 0
                        })}>
                          <Edit size={13} />
                        </button>
                        <button className={styles.deleteBtn} title="Delete" onClick={() => handleDelete(v)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))
              }
            </tbody>
          </Table>
        )}
      </Card>

      {/* Video preview modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Video Preview'} width={640}>
        {selected && (
          <div className={styles.videoWrap}>
            <video src={selected.videoUrl} controls className={styles.video} autoPlay />
            <div className={styles.videoMeta}>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Difficulty</span><span>{selected.difficulty || selected.level || '—'}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Equipment</span><span>{selected.equipment || selected.material || selected.materiel || '—'}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Duration</span><span>{selected.duration || selected.temps || '—'}{typeof selected.duration === 'number' ? 's' : ''}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Series</span><span>{selected.serieNumber || '—'}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Reps</span><span>{selected.repetition || '—'}</span></div>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Edit Video Modal */}
      <Modal open={!!editData} onClose={() => setEditData(null)} title="Edit Video Info">
        {editData && (
          <div className={styles.formGrid}>
            <Input 
              label="Title" 
              value={editData.titre} 
              onChange={e => setEditData({ ...editData, titre: e.target.value })} 
            />
            <div className={styles.row}>
              <Select 
                label="Difficulty" 
                value={editData.difficulty} 
                onChange={e => setEditData({ ...editData, difficulty: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Select>
              <Input 
                label="Duration (sec)" 
                type="number" 
                value={editData.duration} 
                onChange={e => setEditData({ ...editData, duration: e.target.value })} 
              />
            </div>
            <Input 
              label="Equipment" 
              value={editData.equipment} 
              onChange={e => setEditData({ ...editData, equipment: e.target.value })} 
            />
            
            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setEditData(null)}>Cancel</Button>
              <Button loading={saving} onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
