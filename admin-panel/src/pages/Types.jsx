import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Plus } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Table, Th, Td, Tr, EmptyRow } from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import { Input, Textarea, FileInput } from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { getTypes, addType, updateType, deleteType } from '../api/types'
import styles from './Types.module.css'

const EMPTY = { TypeName: '', description: '' }

export default function Types() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getTypes()
      setTypes(res.data || [])
    } catch { toast.error('Failed to load types') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm(EMPTY); setFile(null); setPreview(null); setEditId(null)
    setModal('form')
  }

  const openEdit = (t) => {
    setForm({ TypeName: t.TypeName || '', description: t.description || '' })
    setPreview(t.imageUrl || null); setFile(null); setEditId(t.id)
    setModal('form')
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSave = async () => {
    if (!form.TypeName.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('TypeName', form.TypeName)
      fd.append('description', form.description)
      if (file) fd.append('file', file)

      if (editId) {
        await updateType(editId, fd)
        toast.success('Type updated')
      } else {
        await addType(fd)
        toast.success('Type added')
      }
      setModal(null); load()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this type?')) return
    try {
      await deleteType(id)
      toast.success('Deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <PageHeader
        title="Sport Types"
        subtitle={`${types.length} types`}
        action={<Button icon={<Plus size={15} />} onClick={openAdd}>Add Type</Button>}
      />

      <Card>
        {loading ? <Spinner /> : (
          <Table>
            <thead>
              <tr>
                <Th>Image</Th>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {types.length === 0
                ? <EmptyRow cols={4} message="No types yet" />
                : types.map(t => (
                  <Tr key={t.id}>
                    <Td>
                      {t.imageUrl
                        ? <img src={t.imageUrl} alt={t.TypeName} className={styles.thumb} />
                        : <div className={styles.noImg}>🏷️</div>
                      }
                    </Td>
                    <Td><span className={styles.name}>{t.TypeName}</span></Td>
                    <Td><span className={styles.desc}>{t.description || '—'}</span></Td>
                    <Td>
                      <div className={styles.actions}>
                        <Button variant="ghost" size="sm" icon={<Pencil size={13} />} onClick={() => openEdit(t)}>Edit</Button>
                        <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => handleDelete(t.id)}>Delete</Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              }
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Edit Type' : 'Add Type'}>
        <div className={styles.formGrid}>
          <Input
            label="Type Name *"
            placeholder="e.g. Yoga, Cardio..."
            value={form.TypeName}
            onChange={e => setForm(f => ({ ...f, TypeName: e.target.value }))}
          />
          <Textarea
            label="Description"
            placeholder="Short description..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <FileInput label="Cover Image" accept="image/*" onChange={handleFile} preview={preview} />
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>{editId ? 'Save Changes' : 'Add Type'}</Button>
        </div>
      </Modal>
    </div>
  )
}
