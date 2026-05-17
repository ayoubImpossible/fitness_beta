import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, ChevronDown, ChevronRight, Video } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Table, Th, Td, Tr, EmptyRow } from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import {
  getPrograms, createProgram, deleteProgram,
  addPhase, deletePhase,
  addDay, deleteDay,
  getDayVideos, addVideo, deleteVideo, // Added addVideo
  getFullProgram
} from '../api/programs'
import styles from './Programs.module.css'

const PHASE_TYPES = ['yoga', 'relax', 'musculation', 'cardio']

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [fetching, setFetching] = useState({}) // track loading for specific programs
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)

  // forms
  const [progForm, setProgForm] = useState({ name: '', description: '' })
  const [phaseForm, setPhaseForm] = useState({ phaseNumber: 1, type: 'yoga', muscleAttacker: '', description: '' })
  const [dayForm, setDayForm] = useState({ dayNumber: 1, title: '' })
  const [videoForm, setVideoForm] = useState({ titre: '', description: '', order: 0, duration: 0, video: null, image: null })
  const [ctx, setCtx] = useState({}) // { programId, phaseId, dayId }

  const load = async () => {
    setLoading(true)
    try {
      const res = await getPrograms()
      setPrograms(res.data?.data || [])
    } catch { toast.error('Failed to load programs') }
    finally { setLoading(false) }
  }

  const refreshProgram = async (id) => {
    setFetching(prev => ({ ...prev, [id]: true }))
    try {
      const res = await getFullProgram(id)
      const fullProg = res.data?.data
      if (fullProg) {
        setPrograms(prev => prev.map(p => p.id === id ? fullProg : p))
      }
    } catch { toast.error('Failed to refresh program details') }
    finally { setFetching(prev => ({ ...prev, [id]: false })) }
  }

  useEffect(() => { load() }, [])

  const toggle = async (id) => {
    const isOpening = !expanded[id]
    if (isOpening) {
      await refreshProgram(id)
    }
    setExpanded(e => ({ ...e, [id]: !e[id] }))
  }

  // ── Program ──
  const handleAddProgram = async () => {
    if (!progForm.name.trim()) return toast.error('Name required')
    setSaving(true)
    try {
      await createProgram(progForm)
      toast.success('Program created'); setModal(null); load()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleDeleteProgram = async (id) => {
    if (!confirm('Delete this program and all its content?')) return
    try { await deleteProgram(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  // ── Phase ──
  const handleAddPhase = async () => {
    setSaving(true)
    try {
      await addPhase(ctx.programId, phaseForm)
      toast.success('Phase added'); setModal(null)
      await refreshProgram(ctx.programId)
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDeletePhase = async (programId, phaseId) => {
    if (!confirm('Delete this phase?')) return
    try { 
      await deletePhase(programId, phaseId)
      toast.success('Deleted')
      await refreshProgram(programId)
    } catch { toast.error('Failed') }
  }

  // ── Day ──
  const handleAddDay = async () => {
    setSaving(true)
    try {
      await addDay(ctx.programId, ctx.phaseId, dayForm)
      toast.success('Day added'); setModal(null)
      await refreshProgram(ctx.programId)
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleDeleteDay = async (programId, phaseId, dayId) => {
    if (!confirm('Delete this day?')) return
    try { 
      await deleteDay(programId, phaseId, dayId)
      toast.success('Deleted')
      await refreshProgram(programId)
    } catch { toast.error('Failed') }
  }

  // ── Video ──
  const handleAddVideo = async () => {
    if (!videoForm.video || !videoForm.image) return toast.error('Files required')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('titre', videoForm.titre)
      fd.append('description', videoForm.description)
      fd.append('order', videoForm.order)
      fd.append('duration', videoForm.duration)
      fd.append('video', videoForm.video)
      fd.append('image', videoForm.image)

      await addVideo(ctx.programId, ctx.phaseId, ctx.dayId, fd)
      toast.success('Video uploaded'); setModal(null)
      await refreshProgram(ctx.programId)
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to upload') }
    finally { setSaving(false) }
  }

  const handleDeleteVideo = async (programId, phaseId, dayId, videoId) => {
    if (!confirm('Delete this video?')) return
    try {
      await deleteVideo(programId, phaseId, dayId, videoId)
      toast.success('Deleted')
      await refreshProgram(programId)
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      <PageHeader
        title="Programs"
        subtitle={`${programs.length} programs`}
        action={
          <Button icon={<Plus size={15} />} onClick={() => { setProgForm({ name: '', description: '' }); setModal('program') }}>
            Add Program
          </Button>
        }
      />

      {loading ? <Spinner /> : (
        <div className={styles.list}>
          {programs.length === 0 && (
            <Card><p className={styles.empty}>No programs yet</p></Card>
          )}
          {programs.map(prog => (
            <Card key={prog.id} className={styles.progCard}>
              {/* Program header */}
              <div className={styles.progHeader}>
                <button className={styles.expandBtn} onClick={() => toggle(prog.id)} disabled={fetching[prog.id]}>
                  {fetching[prog.id] 
                    ? <Spinner size={16} /> 
                    : (expanded[prog.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />)
                  }
                </button>
                <div className={styles.progInfo}>
                  <span className={styles.progName}>{prog.name}</span>
                  {prog.description && <span className={styles.progDesc}>{prog.description}</span>}
                </div>
                <div className={styles.progActions}>
                  <Button
                    variant="secondary" size="sm" icon={<Plus size={13} />}
                    onClick={() => { setCtx({ programId: prog.id }); setPhaseForm({ phaseNumber: 1, type: 'yoga', muscleAttacker: '', description: '' }); setModal('phase') }}
                  >Add Phase</Button>
                  <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => handleDeleteProgram(prog.id)}>Delete</Button>
                </div>
              </div>

              {/* Phases */}
              {expanded[prog.id] && (
                <div className={styles.phases}>
                  {(prog.phases || []).length === 0 && (
                    <p className={styles.emptyInner}>No phases — add one above</p>
                  )}
                  {(prog.phases || []).map(phase => (
                    <div key={phase.id} className={styles.phase}>
                      <div className={styles.phaseHeader}>
                        <span className={styles.phaseType}>{phase.type}</span>
                        <span className={styles.phaseName}>Phase {phase.phaseNumber}{phase.muscleAttacker ? ` — ${phase.muscleAttacker}` : ''}</span>
                        <div className={styles.phaseActions}>
                          <Button
                            variant="ghost" size="sm" icon={<Plus size={12} />}
                            onClick={() => { setCtx({ programId: prog.id, phaseId: phase.id }); setDayForm({ dayNumber: 1, title: '' }); setModal('day') }}
                          >Add Day</Button>
                          <Button variant="danger" size="sm" icon={<Trash2 size={12} />} onClick={() => handleDeletePhase(prog.id, phase.id)}>Delete</Button>
                        </div>
                      </div>

                      {/* Days */}
                      <div className={styles.days}>
                        {(phase.days || []).map(day => (
                          <div key={day.id} className={styles.dayGroup}>
                            <div className={styles.day}>
                              <span className={styles.dayNum}>Day {day.dayNumber}</span>
                              <span className={styles.dayTitle}>{day.title}</span>
                              <div className={styles.dayActions}>
                                <Button 
                                  variant="ghost" size="sm" icon={<Plus size={11} />}
                                  onClick={() => { 
                                    setCtx({ programId: prog.id, phaseId: phase.id, dayId: day.id }); 
                                    setVideoForm({ titre: '', description: '', order: 0, duration: 0, video: null, image: null });
                                    setModal('video') 
                                  }}
                                >Add Video</Button>
                                <Button variant="danger" size="sm" icon={<Trash2 size={11} />} onClick={() => handleDeleteDay(prog.id, phase.id, day.id)}>Delete</Button>
                              </div>
                            </div>
                            
                            {/* Videos List */}
                            {(day.videos || []).length > 0 && (
                              <div className={styles.videoList}>
                                {day.videos.map(vid => (
                                  <div key={vid.id} className={styles.videoItem}>
                                    <img src={vid.imageUrl} alt="" className={styles.vidThumb} />
                                    <div className={styles.vidInfo}>
                                      <span className={styles.vidTitle}>{vid.titre}</span>
                                      <span className={styles.vidMeta}>{vid.duration}s • Order {vid.order}</span>
                                    </div>
                                    <button className={styles.deleteVid} onClick={() => handleDeleteVideo(prog.id, phase.id, day.id, vid.id)}>
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Existing Modals... */}
      <Modal open={modal === 'program'} onClose={() => setModal(null)} title="New Program">
        <div className={styles.formGrid}>
          <Input label="Program Name *" placeholder="e.g. 30-Day Abs Challenge" value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" placeholder="What is this program about?" value={progForm.description} onChange={e => setProgForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={saving} onClick={handleAddProgram}>Create Program</Button>
        </div>
      </Modal>

      <Modal open={modal === 'phase'} onClose={() => setModal(null)} title="Add Phase">
        <div className={styles.formGrid}>
          <Input label="Phase Number" type="number" min="1" value={phaseForm.phaseNumber} onChange={e => setPhaseForm(f => ({ ...f, phaseNumber: parseInt(e.target.value) }))} />
          <Select label="Type *" value={phaseForm.type} onChange={e => setPhaseForm(f => ({ ...f, type: e.target.value }))}>
            {PHASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          {phaseForm.type === 'musculation' && (
            <Input label="Muscle Attacker *" placeholder="e.g. abs, chest, back..." value={phaseForm.muscleAttacker} onChange={e => setPhaseForm(f => ({ ...f, muscleAttacker: e.target.value }))} />
          )}
          <Textarea label="Description" value={phaseForm.description} onChange={e => setPhaseForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={saving} onClick={handleAddPhase}>Add Phase</Button>
        </div>
      </Modal>

      <Modal open={modal === 'day'} onClose={() => setModal(null)} title="Add Day">
        <div className={styles.formGrid}>
          <Input label="Day Number" type="number" min="1" value={dayForm.dayNumber} onChange={e => setDayForm(f => ({ ...f, dayNumber: parseInt(e.target.value) }))} />
          <Input label="Title" placeholder="e.g. Day 1 - Warm Up" value={dayForm.title} onChange={e => setDayForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={saving} onClick={handleAddDay}>Add Day</Button>
        </div>
      </Modal>

      {/* NEW VIDEO MODAL */}
      <Modal open={modal === 'video'} onClose={() => setModal(null)} title="Add Video to Day">
        <div className={styles.formGrid}>
          <Input label="Video Title *" value={videoForm.titre} onChange={e => setVideoForm(f => ({ ...f, titre: e.target.value }))} />
          <div className={styles.row}>
            <Input label="Order" type="number" value={videoForm.order} onChange={e => setVideoForm(f => ({ ...f, order: e.target.value }))} />
            <Input label="Duration (sec)" type="number" value={videoForm.duration} onChange={e => setVideoForm(f => ({ ...f, duration: e.target.value }))} />
          </div>
          <Textarea label="Description" value={videoForm.description} onChange={e => setVideoForm(f => ({ ...f, description: e.target.value }))} />
          
          <div className={styles.fileInputs}>
            <div className={styles.fileBox}>
              <label>Video File *</label>
              <input type="file" accept="video/*" onChange={e => setVideoForm(f => ({ ...f, video: e.target.files[0] }))} />
            </div>
            <div className={styles.fileBox}>
              <label>Thumbnail Image *</label>
              <input type="file" accept="image/*" onChange={e => setVideoForm(f => ({ ...f, image: e.target.files[0] }))} />
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={saving} onClick={handleAddVideo}>Upload Video</Button>
        </div>
      </Modal>
    </div>
  )
}
