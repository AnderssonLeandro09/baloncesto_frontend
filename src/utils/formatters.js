/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea una fecha a formato local
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale (default: 'es-EC')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, locale = 'es-EC') => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formatea una fecha con hora
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale (default: 'es-EC')
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date, locale = 'es-EC') => {
  if (!date) return '-'
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad
 * @param {string} currency - Moneda (default: 'USD')
 * @returns {string} Cantidad formateada
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Formatea un número con decimales
 * @param {number} value - Valor
 * @param {number} decimals - Decimales (default: 2)
 * @returns {string} Número formateado
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(decimals)
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Trunca un texto a cierta longitud
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
