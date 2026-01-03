/**
 * Store de UI - Estado global de la interfaz
 * Maneja: sidebar, loading global, notificaciones, tema
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUiStore = create(
  persist(
    (set) => ({
      // Estado del sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Loading global
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Tema (light/dark)
      theme: 'light',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      setTheme: (theme) => set({ theme }),

      // Breadcrumbs
      breadcrumbs: [],
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
    }),
    {
      name: 'ui-storage', // nombre en localStorage
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen,
        theme: state.theme 
      }),
    }
  )
)

export default useUiStore
