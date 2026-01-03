import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        localStorage.setItem('token', token)
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null, isAuthenticated: false })
      },

      checkAuth: () => {
        const token = localStorage.getItem('token')
        if (token && !useAuthStore.getState().token) {
          // Si hay token pero no en el estado, podríamos validar o simplemente confiar
          // Por ahora, el interceptor de axios manejará el 401
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore
