import { Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import Button from './components/Button'

function Placeholder({ name }) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="text-3xl font-bold">{name}</h1>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button>Reserve</Button>
        <Button variant="secondary">Select</Button>
        <Button variant="ghost">Clear all</Button>
        <Button variant="danger">Cancel booking</Button>
        <Button loading>Saving</Button>
        <Button disabled>Add dates</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </div>
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