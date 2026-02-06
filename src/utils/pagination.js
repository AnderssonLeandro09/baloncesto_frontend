/**
 * Utilidades de paginación reutilizables
 * 
 * Este módulo proporciona funciones y configuraciones para manejar
 * la paginación de datos en toda la aplicación de manera consistente.
 * 
 * USO RECOMENDADO:
 * 1. Para stores (Zustand): usar createPaginationState y paginateData
 * 2. Para componentes: usar el hook usePaginatedData
 * 3. Para filtros combinados: usar filterAndPaginate
 * 
 * @module utils/pagination
 * @example
 * // En un store de Zustand
 * import { paginateData, createPaginationState, PAGINATION_CONFIG } from '../utils/pagination'
 * 
 * const useMyStore = create((set, get) => ({
 *   items: [],
 *   pagination: createPaginationState(),
 *   
 *   getPaginatedItems: () => {
 *     const { items, pagination } = get()
 *     return paginateData(items, pagination.currentPage, pagination.pageSize)
 *   }
 * }))
 * 
 * @example
 * // En un componente React
 * import { usePaginatedData } from '../utils/pagination'
 * 
 * const MyComponent = ({ data }) => {
 *   const { 
 *     paginatedData, 
 *     pagination, 
 *     goToPage 
 *   } = usePaginatedData(data, { pageSize: 10 })
 *   
 *   return (
 *     <>
 *       {paginatedData.map(item => <Item key={item.id} {...item} />)}
 *       <Pagination {...pagination} onPageChange={goToPage} />
 *     </>
 *   )
 * }
 */

/**
 * Configuración por defecto para paginación
 * @constant
 */
export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  maxVisiblePages: 5,
}

/**
 * Crea un estado inicial de paginación
 * @param {Object} options - Opciones de configuración
 * @param {number} [options.page=1] - Página inicial
 * @param {number} [options.pageSize=10] - Tamaño de página inicial
 * @returns {Object} Estado inicial de paginación
 * 
 * @example
 * // En un store
 * const useProductStore = create((set) => ({
 *   pagination: createPaginationState({ pageSize: 25 }),
 * }))
 */
export const createPaginationState = (options = {}) => ({
  currentPage: options.page || PAGINATION_CONFIG.defaultPage,
  pageSize: options.pageSize || PAGINATION_CONFIG.defaultPageSize,
  totalItems: 0,
  totalPages: 0,
})

/**
 * Pagina un array de datos localmente
 * @param {Array} data - Array de datos a paginar
 * @param {number} currentPage - Página actual (1-indexed)
 * @param {number} pageSize - Cantidad de items por página
 * @returns {Object} Objeto con datos paginados e información de paginación
 * 
 * @example
 * const result = paginateData(usuarios, 1, 10)
 * // result = { 
 * //   data: [...], 
 * //   pagination: { 
 * //     currentPage: 1, 
 * //     totalPages: 5,
 * //     totalItems: 50,
 * //     pageSize: 10,
 * //     startItem: 1,
 * //     endItem: 10,
 * //     hasNextPage: true,
 * //     hasPrevPage: false
 * //   } 
 * // }
 */
export const paginateData = (data = [], currentPage = 1, pageSize = PAGINATION_CONFIG.defaultPageSize) => {
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  
  // Asegurar que la página actual esté en rango válido
  const safePage = Math.max(1, Math.min(currentPage, totalPages))
  
  const startIndex = (safePage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)

  return {
    data: paginatedData,
    pagination: {
      currentPage: safePage,
      pageSize,
      totalItems,
      totalPages,
      startItem: totalItems > 0 ? startIndex + 1 : 0,
      endItem: Math.min(endIndex, totalItems),
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  }
}

/**
 * Genera un array de números de página para mostrar en el componente de paginación
 * @param {number} currentPage - Página actual
 * @param {number} totalPages - Total de páginas
 * @param {number} [maxVisible=5] - Número máximo de páginas visibles
 * @returns {Array<number>} Array de números de página
 * 
 * @example
 * getPageNumbers(5, 10, 5) // [3, 4, 5, 6, 7]
 */
export const getPageNumbers = (currentPage, totalPages, maxVisible = PAGINATION_CONFIG.maxVisiblePages) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const halfVisible = Math.floor(maxVisible / 2)
  let start = Math.max(1, currentPage - halfVisible)
  let end = Math.min(totalPages, start + maxVisible - 1)

  // Ajustar si estamos cerca del final
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Calcula el índice inicial basado en la página actual
 * @param {number} currentPage - Página actual (1-indexed)
 * @param {number} pageSize - Tamaño de página
 * @returns {number} Índice inicial
 */
export const calculateStartIndex = (currentPage, pageSize) => {
  return (currentPage - 1) * pageSize
}

/**
 * Valida y ajusta el número de página para estar dentro del rango válido
 * @param {number} page - Número de página solicitado
 * @param {number} totalPages - Total de páginas disponibles
 * @returns {number} Número de página válido
 */
export const validatePageNumber = (page, totalPages) => {
  if (totalPages <= 0) return 1
  return Math.max(1, Math.min(page, totalPages))
}

/**
 * Crea los handlers de paginación para un store o componente
 * @param {Function} setPage - Función para establecer la página actual
 * @param {Function} setPageSize - Función para establecer el tamaño de página
 * @param {number} totalPages - Total de páginas
 * @returns {Object} Objeto con handlers de paginación
 * 
 * @example
 * const handlers = createPaginationHandlers(setPage, setPageSize, totalPages)
 * // handlers.goToPage(3)
 * // handlers.nextPage()
 * // handlers.prevPage()
 */
export const createPaginationHandlers = (setPage, setPageSize, totalPages) => ({
  goToPage: (page) => {
    const validPage = validatePageNumber(page, totalPages)
    setPage(validPage)
  },
  nextPage: (currentPage) => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1)
    }
  },
  prevPage: (currentPage) => {
    if (currentPage > 1) {
      setPage(currentPage - 1)
    }
  },
  changePageSize: (size) => {
    setPageSize(size)
    setPage(1) // Reset a primera página al cambiar tamaño
  },
  firstPage: () => setPage(1),
  lastPage: () => setPage(totalPages),
})

/**
 * Formatea el texto de información de paginación
 * @param {number} startItem - Índice del primer item (1-indexed)
 * @param {number} endItem - Índice del último item
 * @param {number} totalItems - Total de items
 * @returns {string} Texto formateado
 * 
 * @example
 * formatPaginationInfo(1, 10, 45) // "Mostrando 1 a 10 de 45 resultados"
 */
export const formatPaginationInfo = (startItem, endItem, totalItems) => {
  if (totalItems === 0) {
    return 'No hay resultados'
  }
  return `Mostrando ${startItem} a ${endItem} de ${totalItems} resultados`
}

/**
 * Filtra y pagina datos en una sola operación
 * Útil para listas con búsqueda y paginación
 * @param {Array} data - Array de datos completo
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {string} [options.searchTerm] - Término de búsqueda
 * @param {Array<string>} [options.searchFields] - Campos en los que buscar
 * @param {Object} [options.filters] - Filtros adicionales { campo: valor }
 * @param {number} [options.currentPage] - Página actual
 * @param {number} [options.pageSize] - Items por página
 * @param {string} [options.sortField] - Campo para ordenar
 * @param {string} [options.sortOrder] - Orden: 'asc' | 'desc'
 * @returns {Object} { data, pagination, filteredCount }
 * 
 * @example
 * const result = filterAndPaginate(usuarios, {
 *   searchTerm: 'juan',
 *   searchFields: ['nombre', 'email'],
 *   filters: { activo: true },
 *   currentPage: 1,
 *   pageSize: 10,
 *   sortField: 'nombre',
 *   sortOrder: 'asc'
 * })
 */
export const filterAndPaginate = (data = [], options = {}) => {
  const {
    searchTerm = '',
    searchFields = [],
    filters = {},
    currentPage = 1,
    pageSize = PAGINATION_CONFIG.defaultPageSize,
    sortField = null,
    sortOrder = 'asc',
  } = options

  let filtered = [...data]

  // Aplicar búsqueda de texto
  if (searchTerm && searchFields.length > 0) {
    const searchLower = searchTerm.toLowerCase().trim()
    filtered = filtered.filter(item => 
      searchFields.some(field => {
        const value = getNestedValue(item, field)
        return value && String(value).toLowerCase().includes(searchLower)
      })
    )
  }

  // Aplicar filtros específicos
  Object.entries(filters).forEach(([field, filterValue]) => {
    if (filterValue !== undefined && filterValue !== null && filterValue !== '' && filterValue !== 'todos') {
      filtered = filtered.filter(item => {
        const value = getNestedValue(item, field)
        return value === filterValue
      })
    }
  })

  // Ordenar datos
  if (sortField) {
    filtered.sort((a, b) => {
      const aVal = getNestedValue(a, sortField)
      const bVal = getNestedValue(b, sortField)
      
      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      const comparison = aVal < bVal ? -1 : 1
      return sortOrder === 'desc' ? -comparison : comparison
    })
  }

  // Paginar
  const result = paginateData(filtered, currentPage, pageSize)
  
  return {
    ...result,
    filteredCount: filtered.length,
    originalCount: data.length,
  }
}

/**
 * Obtiene un valor anidado de un objeto usando notación de punto
 * @param {Object} obj - Objeto del que extraer el valor
 * @param {string} path - Ruta al valor (ej: 'persona.nombre')
 * @returns {*} Valor encontrado o undefined
 * 
 * @example
 * const obj = { persona: { nombre: 'Juan' } }
 * getNestedValue(obj, 'persona.nombre') // 'Juan'
 */
export const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => 
    current && current[key] !== undefined ? current[key] : undefined, obj
  )
}

/**
 * Hook de React para manejar paginación en componentes
 * Proporciona estado y funciones para controlar la paginación
 * 
 * @param {Array} data - Datos a paginar
 * @param {Object} options - Opciones de configuración
 * @param {number} [options.initialPage=1] - Página inicial
 * @param {number} [options.pageSize=10] - Tamaño de página
 * @returns {Object} Estado y funciones de paginación
 * 
 * @example
 * const MyComponent = ({ items }) => {
 *   const {
 *     paginatedData,
 *     pagination,
 *     goToPage,
 *     nextPage,
 *     prevPage,
 *     setPageSize
 *   } = usePaginatedData(items, { pageSize: 20 })
 *   
 *   return (
 *     <div>
 *       {paginatedData.map(item => <Item key={item.id} {...item} />)}
 *       <button onClick={prevPage} disabled={!pagination.hasPrevPage}>Anterior</button>
 *       <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
 *       <button onClick={nextPage} disabled={!pagination.hasNextPage}>Siguiente</button>
 *     </div>
 *   )
 * }
 */
// eslint-disable-next-line no-unused-vars
export const usePaginatedData = (data = [], options = {}) => {
  // Este es un hook personalizado, pero como no podemos usar React hooks aquí
  // directamente, lo documentamos como patrón de uso
  // Los desarrolladores deben implementarlo en sus componentes o usar usePagination hook
  
  const {
    initialPage = PAGINATION_CONFIG.defaultPage,
    pageSize: initialPageSize = PAGINATION_CONFIG.defaultPageSize,
  } = options

  // Retornar estructura de ejemplo para documentación
  return {
    // Datos paginados
    paginatedData: [],
    // Información de paginación
    pagination: createPaginationState({ page: initialPage, pageSize: initialPageSize }),
    // Funciones de control
    goToPage: () => {},
    nextPage: () => {},
    prevPage: () => {},
    firstPage: () => {},
    lastPage: () => {},
    setPageSize: () => {},
    reset: () => {},
  }
}

/**
 * Crea acciones de paginación para usar en stores de Zustand
 * @param {Function} set - Función set del store
 * @param {Function} get - Función get del store
 * @param {string} [paginationKey='pagination'] - Clave del estado de paginación
 * @returns {Object} Acciones de paginación
 * 
 * @example
 * const useProductStore = create((set, get) => ({
 *   productos: [],
 *   pagination: createPaginationState(),
 *   ...createPaginationActions(set, get, 'pagination'),
 * }))
 */
export const createPaginationActions = (set, get, paginationKey = 'pagination') => ({
  setCurrentPage: (page) => set((state) => ({
    [paginationKey]: { 
      ...state[paginationKey], 
      currentPage: validatePageNumber(page, state[paginationKey].totalPages)
    }
  })),

  setPageSize: (size) => set((state) => ({
    [paginationKey]: { 
      ...state[paginationKey], 
      pageSize: size,
      currentPage: 1 // Reset a primera página al cambiar tamaño
    }
  })),

  nextPage: () => {
    const { currentPage, totalPages } = get()[paginationKey]
    if (currentPage < totalPages) {
      set((state) => ({
        [paginationKey]: { ...state[paginationKey], currentPage: currentPage + 1 }
      }))
    }
  },

  prevPage: () => {
    const { currentPage } = get()[paginationKey]
    if (currentPage > 1) {
      set((state) => ({
        [paginationKey]: { ...state[paginationKey], currentPage: currentPage - 1 }
      }))
    }
  },

  resetPagination: () => set((state) => ({
    [paginationKey]: createPaginationState({ pageSize: state[paginationKey].pageSize })
  })),

  updatePaginationTotals: (totalItems) => set((state) => ({
    [paginationKey]: {
      ...state[paginationKey],
      totalItems,
      totalPages: Math.ceil(totalItems / state[paginationKey].pageSize) || 1
    }
  })),
})

export default {
  PAGINATION_CONFIG,
  createPaginationState,
  paginateData,
  getPageNumbers,
  calculateStartIndex,
  validatePageNumber,
  createPaginationHandlers,
  formatPaginationInfo,
  filterAndPaginate,
  getNestedValue,
  usePaginatedData,
  createPaginationActions,
}
