import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export default function RequireAuth({ children, role }) {
  const { signedIn, user } = useAuth()
  const location = useLocation()

  if (!signedIn) {
    const here = location.pathname + location.search
    return <Navigate to={`/login?next=${encodeURIComponent(here)}`} replace />
  }

  if (role && !user?.roles?.includes(role)) {
    return <Navigate to="/no-access" replace />
  }

  return children
}