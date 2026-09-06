import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
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

export async function getHotel(hotelId, { from, to, guests } = {}) {
  const response = await api.get(`/hotels/${hotelId}/info`, {
    params: { startDate: from, endDate: to, roomsCount: guests },
  })
  return response.data
}

export function readError(error, fallback = 'Something went wrong. Please try again.') {
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