import axios from 'axios'

export const axiosi = axios.create({
  withCredentials: true,
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:5000',
})

// Refresh-token based session (cookie auth):
// - access token in `token` cookie expires quickly
// - refresh cookie is httpOnly and sent to `/auth/refresh`
let isRefreshing = false
let refreshPromise = null

const refreshSession = async () => {
  if (isRefreshing && refreshPromise) return refreshPromise
  isRefreshing = true
  refreshPromise = axiosi.post('/auth/refresh').finally(() => {
    isRefreshing = false
    refreshPromise = null
  })
  return refreshPromise
}

axiosi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status
    const original = error?.config

    if ((status === 401 || status === 403) && original && !original._retry) {
      // Prevent infinite loop if the refresh request itself fails
      if (original.url === '/auth/refresh' || original.url === 'auth/refresh') {
        return Promise.reject(error)
      }

      original._retry = true
      try {
        await refreshSession()
        return axiosi(original)
      } catch (e) {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)