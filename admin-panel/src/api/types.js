import api from './axios'

export const getTypes = () => api.get('/types/getTypes')
export const addType = (data) => api.post('/types/add', data)
export const updateType = (id, data) => api.put(`/types/update/${id}`, data)
export const deleteType = (id) => api.delete(`/types/delete/${id}`)
