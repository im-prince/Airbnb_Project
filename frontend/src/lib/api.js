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
    const roles = parseRoles(claims.roles)
    return { id: claims.sub, email: claims.email, roles }
  } catch {
    return null
  }
}

function parseRoles(raw) {
  if (Array.isArray(raw)) return raw
  if (typeof raw !== 'string') return []
  return raw
    .replace(/[[\]]/g, '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean)
}

export async function signup({ name, email, password }) {
  const response = await api.post('/auth/signup', { name, email, password })
  return response.data?.data || response.data
}

export function logout() { localStorage.removeItem('token') }
export function getToken() { return localStorage.getItem('token') }

export async function searchHotels({ city, from, to, guests, page = 0, size = 6 }) {
  const response = await api.get('/hotels/search', {
    params: { city, startDate: from, endDate: to, roomsCount: guests, page, size },
  })
  return response.data?.data || response.data
}

export async function getHotel(hotelId) {
  const response = await api.get(`/hotels/${hotelId}/info`)
  return response.data?.data || response.data
}

export async function getAvailability(hotelId, { from, to }) {
  const response = await api.get(`/hotels/${hotelId}/availability`, {
    params: { startDate: from, endDate: to },
  })
  return response.data?.data || response.data
}

export async function initBooking({ hotelId, roomId, checkInDate, checkOutDate, roomsCount }) {
  const response = await api.post('/bookings/init', { hotelId, roomId, checkInDate, checkOutDate, roomsCount })
  return response.data?.data || response.data
}

export async function addGuests(bookingId, guests) {
  const response = await api.post(`/bookings/${bookingId}/addGuests`, guests)
  return response.data?.data || response.data
}

export async function startPayment(bookingId) {
  const response = await api.post(`/bookings/${bookingId}/payments`)
  return response.data?.data || response.data
}

export async function getBooking(bookingId) {
  const response = await api.get(`/bookings/${bookingId}`)
  return response.data?.data || response.data
}

export async function getMyBookings() {
  const response = await api.get('/bookings/mine')
  return response.data?.data || response.data
}

export async function getProfile() {
  const response = await api.get('/users/profile')
  return response.data?.data || response.data
}

export async function updateProfile(changes) {
  await api.patch('/users/profile', changes)
}

export async function getSavedGuests() {
  const response = await api.get('/users/guests')
  return response.data?.data || response.data
}

export async function createSavedGuest(guest) {
  const response = await api.post('/users/guests', guest)
  return response.data?.data || response.data
}

export async function updateSavedGuest(guestId, guest) {
  await api.put(`/users/guests/${guestId}`, guest)
}

export async function deleteSavedGuest(guestId) {
  await api.delete(`/users/guests/${guestId}`)
}

export function readError(error, fallback = 'Something went wrong. Please try again.') {
  if (error.response?.data?.error?.message) return error.response.data.error.message
  if (error.response?.data?.apiError?.message) return error.response.data.apiError.message
  if (error.response?.data?.message) return error.response.data.message
  if (error.code === 'ERR_NETWORK') return 'Could not reach the server. Is the backend running?'
  return fallback
}

export default api