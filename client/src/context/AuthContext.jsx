import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService.js'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('weoowe_token')
    if (token) {
      authService.getMe()
        .then(r => setUser(r.data.data))
        .catch(() => localStorage.removeItem('weoowe_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password })
    localStorage.setItem('weoowe_token', data.data.token)
    setUser(data.data.user)
    toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}! 👋`)
    return data
  }

  const register = async (formData) => {
    const { data } = await authService.register(formData)
    localStorage.setItem('weoowe_token', data.data.token)
    setUser(data.data.user)
    toast.success('Account created successfully!')
    return data
  }

  const logout = async () => {
    try { await authService.logout() } catch {}
    localStorage.removeItem('weoowe_token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
