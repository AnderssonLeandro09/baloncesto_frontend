/**
 * Utilidades generales
 */

/**
 * Genera un ID único
 * @returns {string}
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Delay/Sleep
 * @param {number} ms - Milisegundos
 * @returns {Promise}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Debounce function
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Clona un objeto profundamente
 * @param {object} obj - Objeto a clonar
 * @returns {object}
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Obtiene un valor anidado de un objeto
 * @param {object} obj - Objeto
 * @param {string} path - Ruta (ej: 'user.address.city')
 * @param {any} defaultValue - Valor por defecto
 * @returns {any}
 */
export const getNestedValue = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }
  
  return result ?? defaultValue
}

/**
 * Convierte parámetros a query string
 * @param {object} params - Parámetros
 * @returns {string}
 */
export const toQueryString = (params) => {
  return Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

/**
 * Clasifica valores para clases de Tailwind
 * @param  {...any} classes - Clases
 * @returns {string}
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
