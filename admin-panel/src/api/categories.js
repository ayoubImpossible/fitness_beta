import api from './axios'

export const getCategoriesByType = (typeId) => api.get(`/categorie/type/${typeId}/all`)
export const getAllCategories = () => api.get('/categorie/all')
export const addCategory = (typeId, data) => api.post(`/categorie/type/${typeId}/categorie/add`, data)
export const updateCategory = (typeId, categoryId, data) => api.put(`/categorie/type/${typeId}/update/${categoryId}`, data)
export const deleteCategory = (id) => api.delete(`/categorie/delete/${id}`)
