import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// The public GET routes are cached by Vercel's CDN for the mobile app.
// The admin must always see fresh data right after an edit, so every admin
// GET asks for `refresh=true` (never CDN-cached, and skips the server cache).
api.interceptors.request.use((config) => {
  if ((config.method || 'get').toLowerCase() === 'get') {
    config.params = { ...(config.params || {}), refresh: 'true' }
  }
  return config
})

export default api
