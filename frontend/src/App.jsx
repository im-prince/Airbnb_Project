import { Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import Login from './pages/Login'

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
        <Route path="/hotels/:hotelId" element={<Placeholder name="Hotel detail" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Placeholder name="Sign up" />} />

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
    </>
  )
}