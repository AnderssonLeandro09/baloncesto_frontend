/**
 * Store de Estudiantes de Vinculación - Estado global
 */
import { create } from 'zustand'
import { EstudianteVinculacionService } from '../api'

const useEstudianteVinculacionStore = create((set, get) => ({
  // Estado
  estudiantes: [],
  estudianteSeleccionado: null,
  loading: false,
  error: null,
  filtros: { search: '', page: 1, pageSize: 10 },
  totalItems: 0,

  // Acciones
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  setEstudianteSeleccionado: (estudiante) => set({ estudianteSeleccionado: estudiante }),

  clearEstudianteSeleccionado: () => set({ estudianteSeleccionado: null }),

  fetchEstudiantes: async () => {
    set({ loading: true, error: null })
    try {
      const response = await EstudianteVinculacionService.getAll(get().filtros)
      set({ 
        estudiantes: response.results || response || [],
        totalItems: response.count || 0,
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createEstudiante: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await EstudianteVinculacionService.create(data)
      set((state) => ({ 
        estudiantes: [...state.estudiantes, response],
        loading: false 
      }))
      return { success: true, data: response }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  updateEstudiante: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await EstudianteVinculacionService.update(id, data)
      set((state) => ({
        estudiantes: state.estudiantes.map(e => e.estudiante.id === parseInt(id) ? response : e),
        estudianteSeleccionado: null,
        loading: false
      }))
      return { success: true, data: response }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  deleteEstudiante: async (id) => {
    set({ loading: true, error: null })
    try {
      await EstudianteVinculacionService.delete(id)
      set((state) => ({
        estudiantes: state.estudiantes.filter(e => e.estudiante.id !== parseInt(id)),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  reset: () => set({
    estudiantes: [],
    estudianteSeleccionado: null,
    loading: false,
    error: null,
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default useEstudianteVinculacionStore
