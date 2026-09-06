import { Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import { HotelGridSkeleton } from './components/Skeleton'

function Placeholder({ name }) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">{name}</h1>
      <HotelGridSkeleton />
    </div>
  )
}

export default function App() {
  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<Placeholder name="Home" />} />
        <Route path="/search" element={<Placeholder name="Search results" />} />
        <Route path="/hotels/:hotelId" element={<Placeholder name="Hotel detail" />} />
        <Route path="/login" element={<Placeholder name="Login" />} />
        <Route path="/signup" element={<Placeholder name="Sign up" />} />
        <Route path="/trips" element={<Placeholder name="My trips" />} />
        <Route path="/manager" element={<Placeholder name="Manager dashboard" />} />
        <Route path="*" element={<Placeholder name="Page not found" />} />
      </Routes>
      <Footer />
    </>
  )
}