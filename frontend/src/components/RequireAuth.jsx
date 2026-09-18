import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export default function RequireAuth({ children }) {
  const { signedIn } = useAuth()
  const location = useLocation()

  if (!signedIn) {
    const here = location.pathname + location.search
    return <Navigate to={`/login?next=${encodeURIComponent(here)}`} replace />
  }

  return children
}