/**
 * Utilidades de paginación reutilizables
 * 
 * Este módulo proporciona funciones y configuraciones para manejar
 * la paginación de datos en toda la aplicación de manera consistente.
 * 
 * @module utils/pagination
 * @example
 * import { paginateData, createPaginationState, PAGINATION_CONFIG } from '../utils/pagination'
 * 
 * // Paginar datos localmente
 * const paginatedData = paginateData(myData, currentPage, pageSize)
 * 
 * // Crear estado inicial de paginación
 * const initialState = createPaginationState()
 */

/**
 * Configuración por defecto para paginación
 * @constant
 */
export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50],
  maxVisiblePages: 5,
}

/**
 * Crea un estado inicial de paginación
 * @param {Object} options - Opciones de configuración
 * @param {number} [options.page=1] - Página inicial
 * @param {number} [options.pageSize=10] - Tamaño de página inicial
 * @returns {Object} Estado inicial de paginación
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
 * // result = { data: [...], pagination: { currentPage: 1, totalPages: 5, ... } }
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

export default {
  PAGINATION_CONFIG,
  createPaginationState,
  paginateData,
  getPageNumbers,
  calculateStartIndex,
  validatePageNumber,
  createPaginationHandlers,
  formatPaginationInfo,
}
