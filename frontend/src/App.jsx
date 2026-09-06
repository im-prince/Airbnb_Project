import { Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import Button from './components/Button'
import Button from './components/Input'


function Placeholder({ name }) {
  return (
    <div className="mx-auto max-w-[560px] px-6 py-10">
      <h1 className="text-3xl font-bold">{name}</h1>
      <div className="mt-6 flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" hint="At least 8 characters" />
        <Input label="City" placeholder="Jaipur" error="Please enter a city" />
        <Input label="Phone" placeholder="Disabled example" disabled />
        <Button>Continue</Button>
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