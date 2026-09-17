import { createContext, useContext, useState } from 'react'
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

  const signedIn = Boolean(getToken() && user)
  async function signIn({ email, password }) {
    const result = await loginRequest({ email, password })
    const person = result.user
    setUser(person)
    localStorage.setItem('user', JSON.stringify(person))
    return person
  }

  async function register({ name, email, password }) {
    await signupRequest({ name, email, password })
    return signIn({ email, password })
  }

  function signOut() {
    clearToken()
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signedIn, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}