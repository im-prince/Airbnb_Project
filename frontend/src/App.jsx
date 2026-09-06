import { Routes, Route } from 'react-router-dom'
import ThemeToggle from './components/ThemeToggle'

function Placeholder({ name }) {
  return (
    <div style={{ padding: 40 }}>
      <ThemeToggle />
      <h1>{name}</h1>
    </div>
  )
}

export default function App() {
  return (
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
  )
}