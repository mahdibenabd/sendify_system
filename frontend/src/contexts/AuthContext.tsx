import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

// Auth Context
const AuthContext = createContext<{
  user: any | null
  loading: boolean
  logout: () => void
}>({
  user: null,
  loading: true,
  logout: () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      apiFetch('/api/auth/me')
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}



