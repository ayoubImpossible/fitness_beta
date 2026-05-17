import api from './axios'

export const getPrograms = () => api.get('/programs')
export const getProgramById = (id) => api.get(`/programs/${id}`)
export const getFullProgram = (id) => api.get(`/programs/${id}/full`)
export const createProgram = (data) => api.post('/programs', data)
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data)
export const deleteProgram = (id) => api.delete(`/programs/${id}`)

export const addPhase = (programId, data) => api.post(`/programs/${programId}/phases`, data)
export const updatePhase = (programId, phaseId, data) => api.put(`/programs/${programId}/phases/${phaseId}`, data)
export const deletePhase = (programId, phaseId) => api.delete(`/programs/${programId}/phases/${phaseId}`)

export const addDay = (programId, phaseId, data) => api.post(`/programs/${programId}/phases/${phaseId}/days`, data)
export const deleteDay = (programId, phaseId, dayId) => api.delete(`/programs/${programId}/phases/${phaseId}/days/${dayId}`)

export const getDayVideos = (programId, phaseId, dayId) => api.get(`/programs/${programId}/phases/${phaseId}/days/${dayId}/videos`)
export const addVideo = (programId, phaseId, dayId, formData) => api.post(`/programs/${programId}/phases/${phaseId}/days/${dayId}/videos`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteVideo = (programId, phaseId, dayId, videoId) => api.delete(`/programs/${programId}/phases/${phaseId}/days/${dayId}/videos/${videoId}`)
