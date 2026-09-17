import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      const here = window.location.pathname + window.location.search
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?next=${encodeURIComponent(here)}`
      }
    }
    return Promise.reject(error)
  }
)

export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password })
  const payload = response.data?.data || response.data
  const token = payload.accessToken || payload.token
  if (token) {
    localStorage.setItem('token', token)
  }
  return { token, user: readUserFromToken(token) }
}

export function readUserFromToken(token) {
  if (!token) return null
  try {
    const middle = token.split('.')[1]
    const json = atob(middle.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json)
    return {
      id: claims.sub,
      email: claims.email,
      roles: claims.roles,
    }
  } catch {
    return null
  }
}

export async function signup({ name, email, password }) {
  const response = await api.post('/auth/signup', { name, email, password })
  return response.data?.data || response.data
}
export function logout() {
  localStorage.removeItem('token')
}

export function getToken() {
  return localStorage.getItem('token')
}

export async function searchHotels({ city, from, to, guests, page = 0, size = 6 }) {
  const response = await api.get('/hotels/search', {
    params: {
      city,
      startDate: from,
      endDate: to,
      roomsCount: guests,
      page,
      size,
    },
  })
  return response.data
}

export async function getHotel(hotelId) {
  const response = await api.get(`/hotels/${hotelId}/info`)
  return response.data
}

export function readError(error, fallback = 'Something went wrong. Please try again.') {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  if (error.response?.data?.apiError?.message) {
    return error.response.data.apiError.message
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.code === 'ERR_NETWORK') {
    return 'Could not reach the server. Is the backend running?'
  }
  return fallback
}

export default api