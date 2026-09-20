export const managerRoutes = {
  dashboard: '/manager',
  newHotel: '/manager/hotels/new',
  editHotel: (hotelId) => `/manager/hotels/${hotelId}/edit`,
  rooms: (hotelId) => `/manager/hotels/${hotelId}/rooms`,
  newRoom: (hotelId) => `/manager/hotels/${hotelId}/rooms/new`,
  editRoom: (hotelId, roomId) => `/manager/hotels/${hotelId}/rooms/${roomId}/edit`,
  inventory: (hotelId, roomId) => `/manager/hotels/${hotelId}/rooms/${roomId}/inventory`,
  bookings: (hotelId) => `/manager/hotels/${hotelId}/bookings`,
  reports: (hotelId) => `/manager/hotels/${hotelId}/reports`,
}