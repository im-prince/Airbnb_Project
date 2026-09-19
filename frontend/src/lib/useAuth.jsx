import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { login as loginRequest, signup as signupRequest, logout as clearToken, getToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const signIn = useCallback(async ({ email, password }) => {
    const data = await loginRequest({ email, password })
    const person = data.user || { email }
    setUser(person)
    localStorage.setItem('user', JSON.stringify(person))
    return person
  }, [])

  const register = useCallback(
    async ({ name, email, password }) => {
      await signupRequest({ name, email, password })
      return signIn({ email, password })
    },
    [signIn]
  )

  const signOut = useCallback(() => {
    clearToken()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const signedIn = Boolean(getToken() && user)

  const value = useMemo(
    () => ({ user, signedIn, signIn, register, signOut }),
    [user, signedIn, signIn, register, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}