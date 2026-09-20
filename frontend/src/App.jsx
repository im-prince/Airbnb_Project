import { Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import Login from './pages/Login'
import Signup from './pages/Signup'
import HotelDetail from './pages/HotelDetail'
import NotFound from './pages/NotFound'
import Toaster from './components/Toaster'
import Forbidden from './pages/Forbidden'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import BookingDone from './pages/BookingDone'
import MyTrips from './pages/MyTrips'
import TripDetail from './pages/TripDetail'
import Profile from './pages/Profile'
import SavedGuests from './pages/SavedGuests'
import ManagerDashboard from './pages/ManagerDashboard'
import HotelForm from './pages/HotelForm'
import RoomsList from './pages/RoomsList'
import RoomForm from './pages/RoomForm'
import InventoryCalendar from './pages/InventoryCalendar'
import HotelBookings from './pages/HotelBookings'
import RevenueReport from './pages/RevenueReport'

function Placeholder({ name }) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="text-3xl font-bold">{name}</h1>
    </div>
  )
}

export default function App() {
  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/hotels/:hotelId" element={<HotelDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/no-access" element={<Forbidden />} />

        <Route
          path="/checkout/:bookingId"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />

        <Route
          path="/checkout/:bookingId/pay"
          element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          }
        />

        <Route
          path="/bookings/:bookingId/done"
          element={
            <RequireAuth>
              <BookingDone />
            </RequireAuth>
          }
        />

        <Route
          path="/trips/:bookingId"
          element={
            <RequireAuth>
              <TripDetail />
            </RequireAuth>
          }
        />

        <Route
          path="/trips"
          element={
            <RequireAuth>
              <MyTrips />
            </RequireAuth>
          }
        />

        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/guests" element={<RequireAuth><SavedGuests /></RequireAuth>} />

        <Route path="/manager" element={<RequireAuth><ManagerDashboard /></RequireAuth>} />
        <Route path="/manager/hotels/new" element={<RequireAuth><HotelForm /></RequireAuth>} />
        <Route path="/manager/hotels/:hotelId/edit" element={<RequireAuth><HotelForm /></RequireAuth>} />
        <Route path="/manager/hotels/:hotelId/rooms" element={<RequireAuth><RoomsList /></RequireAuth>} />
        <Route path="/manager/hotels/:hotelId/rooms/new" element={<RequireAuth><RoomForm /></RequireAuth>} />
        <Route path="/manager/hotels/:hotelId/rooms/:roomId/edit" element={<RequireAuth><RoomForm /></RequireAuth>} />
        <Route path="/manager/hotels/:hotelId/rooms/:roomId/inventory" element={<RequireAuth><InventoryCalendar /></RequireAuth>} />
        <Route path="/manager/hotels/:hotelId/bookings" element={<RequireAuth><HotelBookings /></RequireAuth>} />
        <Route path="/manager/hotels/:hotelId/reports" element={<RequireAuth><RevenueReport /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Toaster />
    </>
  )
}