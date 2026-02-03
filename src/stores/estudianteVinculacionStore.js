/**
 * Store de Estudiantes de Vinculación - Estado global
 * 
 * Maneja el nuevo formato de respuesta del backend:
 * { msg: string, data: any, code: number, status: 'success' | 'error' }
 */
import { create } from 'zustand'
import { EstudianteVinculacionService } from '../api'

const useEstudianteVinculacionStore = create((set, get) => ({
  // Estado
  estudiantes: [],
  estudianteSeleccionado: null,
  loading: false,
  error: null,
  fieldErrors: {}, // Errores por campo para mostrar en formularios
  filtros: { search: '', page: 1, pageSize: 10 },
  totalItems: 0,

  // Acciones
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  setEstudianteSeleccionado: (estudiante) => set({ estudianteSeleccionado: estudiante }),

  clearEstudianteSeleccionado: () => set({ estudianteSeleccionado: null }),

  // Limpiar errores de campo
  clearErrors: () => set({ error: null, fieldErrors: {} }),

  // Establecer errores de campo manualmente
  setFieldErrors: (errors) => set({ fieldErrors: errors }),

  fetchEstudiantes: async () => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const result = await EstudianteVinculacionService.getAll(get().filtros)
      
      if (result.success) {
        const data = result.data
        set({ 
          estudiantes: data?.results || data || [],
          totalItems: data?.count || 0,
          loading: false 
        })
      } else {
        set({ 
          error: result.message, 
          fieldErrors: result.fieldErrors || {},
          loading: false 
        })
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createEstudiante: async (data) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const result = await EstudianteVinculacionService.create(data)
      
      if (result.success) {
        set((state) => ({ 
          estudiantes: [...state.estudiantes, result.data],
          loading: false 
        }))
        return { 
          success: true, 
          data: result.data,
          message: result.message || 'Estudiante creado exitosamente'
        }
      } else {
        set({ 
          error: result.message, 
          fieldErrors: result.fieldErrors || {},
          loading: false 
        })
        return { 
          success: false, 
          error: result.message,
          fieldErrors: result.fieldErrors || {}
        }
      }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message, fieldErrors: {} }
    }
  },

  updateEstudiante: async (id, data) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const result = await EstudianteVinculacionService.update(id, data)
      
      if (result.success) {
        set((state) => ({
          estudiantes: state.estudiantes.map(e => 
            e.estudiante?.id === parseInt(id) ? result.data : e
          ),
          estudianteSeleccionado: null,
          loading: false
        }))
        return { 
          success: true, 
          data: result.data,
          message: result.message || 'Estudiante actualizado exitosamente'
        }
      } else {
        set({ 
          error: result.message,
          fieldErrors: result.fieldErrors || {},
          loading: false 
        })
        return { 
          success: false, 
          error: result.message,
          fieldErrors: result.fieldErrors || {}
        }
      }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message, fieldErrors: {} }
    }
  },

  deleteEstudiante: async (id) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const result = await EstudianteVinculacionService.delete(id)
      
      if (result.success) {
        set((state) => ({
          estudiantes: state.estudiantes.filter(e => e.estudiante?.id !== parseInt(id)),
          loading: false
        }))
        return { 
          success: true,
          message: result.message || 'Estudiante eliminado exitosamente'
        }
      } else {
        set({ 
          error: result.message,
          fieldErrors: result.fieldErrors || {},
          loading: false 
        })
        return { 
          success: false, 
          error: result.message 
        }
      }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  toggleEstado: async (id) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const result = await EstudianteVinculacionService.toggleEstado(id)
      
      if (result.success) {
        set((state) => ({
          estudiantes: state.estudiantes.map(e => 
            e.estudiante?.id === parseInt(id) ? result.data : e
          ),
          loading: false
        }))
        return { 
          success: true, 
          data: result.data,
          message: result.message || 'Estado actualizado exitosamente'
        }
      } else {
        set({ 
          error: result.message,
          fieldErrors: result.fieldErrors || {},
          loading: false 
        })
        return { 
          success: false, 
          error: result.message 
        }
      }
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
    fieldErrors: {},
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default useEstudianteVinculacionStore
