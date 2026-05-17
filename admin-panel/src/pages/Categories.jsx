import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Table, Th, Td, Tr, EmptyRow } from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import { Input, Textarea, Select, FileInput } from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { getTypes } from '../api/types'
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '../api/categories'
import { getAdminFullTree } from '../api/admin'
import styles from './Categories.module.css'

const EMPTY = { CategorieName: '', description: '', DurationCategorie: '' }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterType, setFilterType] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [treeRes, typesRes] = await Promise.all([getAdminFullTree(), getTypes()])
      setCategories(treeRes.data || [])
      setTypes(typesRes.data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const toggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => { load() }, [])

  const filtered = filterType
    ? categories.filter(c => c.typeId === filterType)
    : categories

  const openAdd = () => {
    setForm(EMPTY); setFile(null); setPreview(null)
    setEditId(null); setSelectedTypeId(types[0]?.id || '')
    setModal('form')
  }

  const openEdit = (c) => {
    setForm({
      CategorieName: c.CategorieName || '',
      description: c.description || '',
      DurationCategorie: c.DurationCategorie || '',
    })
    setSelectedTypeId(c.typeId || '')
    setPreview(c.Imagebackground || null)
    setFile(null); setEditId(c.id)
    setModal('form')
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  const handleSave = async () => {
    if (!form.CategorieName.trim()) return toast.error('Name is required')
    if (!selectedTypeId) return toast.error('Select a type')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('file', file)

      if (editId) {
        await updateCategory(selectedTypeId, editId, fd)
        toast.success('Category updated')
      } else {
        await addCategory(selectedTypeId, fd)
        toast.success('Category added')
      }
      setModal(null); load()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await deleteCategory(id)
      toast.success('Deleted'); load()
    } catch { toast.error('Failed to delete') }
  }

  const getTypeName = (typeId) => types.find(t => t.id === typeId)?.TypeName || '—'

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${filtered.length} categories`}
        action={<Button icon={<Plus size={15} />} onClick={openAdd}>Add Category</Button>}
      />

      {/* Filter */}
      <div className={styles.filterRow}>
        <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => <option key={t.id} value={t.id}>{t.TypeName}</option>)}
        </Select>
      </div>

      <Card>
        {loading ? <Spinner /> : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '40px' }}></Th>
                <Th>Image</Th>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Duration</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <EmptyRow cols={6} message="No categories found" />
                : filtered.map(c => (
                  <React.Fragment key={c.id}>
                    <Tr>
                      <Td>
                        <button className={styles.expandBtn} onClick={() => toggle(c.id)}>
                          {expanded[c.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </Td>
                      <Td>
                        {c.Imagebackground
                          ? <img src={c.Imagebackground} alt={c.CategorieName} className={styles.thumb} />
                          : <div className={styles.noImg}>📁</div>
                        }
                      </Td>
                      <Td><span className={styles.name}>{c.CategorieName}</span></Td>
                      <Td><span className={styles.badge}>{getTypeName(c.typeId)}</span></Td>
                      <Td><span className={styles.muted}>{c.DurationCategorie || '—'}</span></Td>
                      <Td>
                        <div className={styles.actions}>
                          <Button variant="ghost" size="sm" icon={<Pencil size={13} />} onClick={() => openEdit(c)}>Edit</Button>
                          <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => handleDelete(c.id)}>Delete</Button>
                        </div>
                      </Td>
                    </Tr>
                    {expanded[c.id] && (
                      <Tr className={styles.nestedRow}>
                        <Td colSpan={6}>
                          <div className={styles.nestedContent}>
                            {(!c.exercises || c.exercises.length === 0) ? (
                              <p className={styles.muted}>No exercises found for this category.</p>
                            ) : (
                              c.exercises.map(ex => (
                                <div key={ex.id} className={styles.exerciseItem}>
                                  <div className={styles.exHeader}>
                                    <span>{ex.Title || ex.name || 'Untitled Exercise'}</span>
                                    <span className={styles.exBadge}>{ex.difficulty || 'No Difficulty'}</span>
                                  </div>
                                  
                                  {ex.levels && ex.levels.length > 0 ? (
                                    <div className={styles.levelsList}>
                                      {ex.levels.map(lvl => (
                                        <div key={lvl.id} className={styles.levelGroup}>
                                          <div className={styles.lvlHeader}>{lvl.name || lvl.Title || 'Level'}</div>
                                          <div className={styles.videoGrid}>
                                            {lvl.videos.map(v => (
                                              <div key={v.id} className={styles.videoCard}>
                                                <img src={v.imageUrl} alt="" className={styles.vidThumb} />
                                                <div className={styles.vidInfo}>
                                                  <span className={styles.vidTitle}>{v.titre || v.name}</span>
                                                  <span className={styles.vidMeta}>{v.duration || '—'}s</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className={styles.videoGrid}>
                                      {(!ex.videos || ex.videos.length === 0) ? (
                                        <p className={styles.muted} style={{ fontSize: '12px' }}>No videos.</p>
                                      ) : (
                                        ex.videos.map(v => (
                                          <div key={v.id} className={styles.videoCard}>
                                            <img src={v.imageUrl} alt="" className={styles.vidThumb} />
                                            <div className={styles.vidInfo}>
                                              <span className={styles.vidTitle}>{v.titre || v.name}</span>
                                              <span className={styles.vidMeta}>{v.duration || '—'}s</span>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                ))
              }
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Edit Category' : 'Add Category'}>
        <div className={styles.formGrid}>
          <Select
            label="Sport Type *"
            value={selectedTypeId}
            onChange={e => setSelectedTypeId(e.target.value)}
          >
            <option value="">Select type...</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.TypeName}</option>)}
          </Select>
          <Input
            label="Category Name *"
            placeholder="e.g. Lower Body / Legs"
            value={form.CategorieName}
            onChange={e => setForm(f => ({ ...f, CategorieName: e.target.value }))}
          />
          <Input
            label="Duration"
            placeholder="e.g. 10 weeks"
            value={form.DurationCategorie}
            onChange={e => setForm(f => ({ ...f, DurationCategorie: e.target.value }))}
          />
          <Textarea
            label="Description"
            placeholder="Short description..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <FileInput label="Background Image" accept="image/*" onChange={handleFile} preview={preview} />
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>{editId ? 'Save Changes' : 'Add Category'}</Button>
        </div>
      </Modal>
    </div>
  )
}
