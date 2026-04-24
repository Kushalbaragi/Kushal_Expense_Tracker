import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const AUTH_KEY = 'kexp_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  function login(userData) {
    const enriched = { ...userData, joinDate: userData.joinDate || new Date().toISOString() }
    localStorage.setItem(AUTH_KEY, JSON.stringify(enriched))
    setUser(enriched)
  }

  function signup(userData) {
    const enriched = { ...userData, joinDate: new Date().toISOString() }
    localStorage.setItem(AUTH_KEY, JSON.stringify(enriched))
    setUser(enriched)
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
