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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        <Route path="/hotels/:hotelId" element={<HotelDetail />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/no-access" element={<Forbidden />} />

        <Route
          path="/trips"
          element={
            <RequireAuth>
              <Placeholder name="My trips" />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Placeholder name="Profile" />
            </RequireAuth>
          }
        />

        <Route
          path="/manager"
          element={
            <RequireAuth>
              <Placeholder name="Manager dashboard" />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Placeholder name="Page not found" />} />
      </Routes>
      <Footer />
      <Toaster />
    </>
  )
}