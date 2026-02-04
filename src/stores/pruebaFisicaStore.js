/**
 * Store de Pruebas Físicas - Estado global con paginación
 */
import { create } from 'zustand'
import { PruebaFisicaService } from '../api'
import { resolveBackendError } from '../config/errorMessages'
import { 
  MENSAJES_EXITO
} from '../utils/validacionesPruebasFisicas'
import { 
  PAGINATION_CONFIG, 
  createPaginationState 
} from '../utils/pagination'

const usePruebaFisicaStore = create((set, get) => ({
  // Estado
  pruebas: [],
  pruebaSeleccionada: null,
  loading: false,
  error: null,
  fieldErrors: {}, // Errores de campos específicos para formularios
  
  // Estado de paginación
  pagination: createPaginationState(),
  
  // Filtros
  filtros: { 
    search: '', 
    tipo: 'todos',
    estado: 'todos',
    semestre: 'todos'
  },

  // Acciones de paginación
  setCurrentPage: (page) => set((state) => ({
    pagination: { ...state.pagination, currentPage: page }
  })),

  setPageSize: (size) => set((state) => ({
    pagination: { 
      ...state.pagination, 
      pageSize: size,
      currentPage: 1 // Reset a primera página al cambiar tamaño
    }
  })),

  // Acciones de filtros
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros },
    pagination: { ...state.pagination, currentPage: 1 } // Reset paginación al filtrar
  })),

  clearFiltros: () => set({
    filtros: { 
      search: '', 
      tipo: 'todos',
      estado: 'todos',
      semestre: 'todos'
    },
    pagination: createPaginationState()
  }),

  setPruebaSeleccionada: (prueba) => set({ pruebaSeleccionada: prueba }),

  clearPruebaSeleccionada: () => set({ pruebaSeleccionada: null }),

  clearErrors: () => set({ error: null, fieldErrors: {} }),

  fetchPruebas: async () => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const data = await PruebaFisicaService.getAll()
      const pruebasArray = Array.isArray(data) ? data : []
      
      set({ 
        pruebas: pruebasArray,
        pagination: {
          ...get().pagination,
          totalItems: pruebasArray.length,
          totalPages: Math.ceil(pruebasArray.length / get().pagination.pageSize) || 1
        },
        loading: false 
      })
    } catch (error) {
      const mensaje = resolveBackendError(error)
      set({ 
        error: mensaje, 
        loading: false,
        pruebas: []
      })
    }
  },

  createPrueba: async (data) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const response = await PruebaFisicaService.create(data)
      set((state) => ({ 
        pruebas: [...state.pruebas, response],
        pagination: {
          ...state.pagination,
          totalItems: state.pruebas.length + 1
        },
        loading: false 
      }))
      return { success: true, data: response, message: MENSAJES_EXITO.CREAR }
    } catch (error) {
      const mensaje = resolveBackendError(error)
      set({ 
        error: mensaje, 
        fieldErrors: error.fieldErrors || {},
        loading: false 
      })
      return { success: false, error: mensaje, fieldErrors: error.fieldErrors || {} }
    }
  },

  updatePrueba: async (id, data) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const response = await PruebaFisicaService.update(id, data)
      set((state) => ({
        pruebas: state.pruebas.map(p => p.id === id ? response : p),
        pruebaSeleccionada: null,
        loading: false
      }))
      return { success: true, data: response, message: MENSAJES_EXITO.ACTUALIZAR }
    } catch (error) {
      const mensaje = resolveBackendError(error)
      set({ 
        error: mensaje, 
        fieldErrors: error.fieldErrors || {},
        loading: false 
      })
      return { success: false, error: mensaje, fieldErrors: error.fieldErrors || {} }
    }
  },

  deletePrueba: async (id) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      await PruebaFisicaService.delete(id)
      set((state) => ({
        pruebas: state.pruebas.filter(p => p.id !== id),
        pagination: {
          ...state.pagination,
          totalItems: state.pruebas.length - 1
        },
        loading: false
      }))
      return { success: true }
    } catch (error) {
      const mensaje = resolveBackendError(error)
      set({ error: mensaje, loading: false })
      return { success: false, error: mensaje }
    }
  },

  toggleEstado: async (id) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const response = await PruebaFisicaService.toggleEstado(id)
      const wasActive = get().pruebas.find(p => p.id === id)?.estado
      set((state) => ({
        pruebas: state.pruebas.map(p => p.id === id ? response : p),
        loading: false
      }))
      return { 
        success: true, 
        data: response, 
        message: wasActive ? MENSAJES_EXITO.DESACTIVAR : MENSAJES_EXITO.ACTIVAR 
      }
    } catch (error) {
      const mensaje = resolveBackendError(error)
      set({ error: mensaje, loading: false })
      return { success: false, error: mensaje }
    }
  },

  reset: () => set({
    pruebas: [],
    pruebaSeleccionada: null,
    loading: false,
    error: null,
    fieldErrors: {},
    filtros: { 
      search: '', 
      tipo: 'todos',
      estado: 'todos',
      semestre: 'todos'
    },
    pagination: createPaginationState(),
  }),
}))

export default usePruebaFisicaStore
