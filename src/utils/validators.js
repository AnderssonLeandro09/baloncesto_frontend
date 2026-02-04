/**
 * Utilidades para validación de datos
 */

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida si una cédula ecuatoriana es válida
 * @param {string} cedula - Cédula a validar
 * @returns {boolean}
 */
export const isValidCedula = (cedula) => {
  if (!cedula || cedula.length !== 10) return false
  
  const digits = cedula.split('').map(Number)
  const provinceCode = parseInt(cedula.substring(0, 2))
  
  if (provinceCode < 1 || provinceCode > 24) return false
  
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let sum = 0
  
  for (let i = 0; i < 9; i++) {
    let value = digits[i] * coefficients[i]
    if (value > 9) value -= 9
    sum += value
  }
  
  const checkDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10)
  return checkDigit === digits[9]
}

/**
 * Valida si un teléfono es válido (Ecuador)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false
  const cleaned = phone.replace(/[\s-]/g, '')
  // Formato ecuatoriano: celular (09XXXXXXXX) o fijo (0X-XXXXXXX)
  const regex = /^(09\d{8}|0[2-7]\d{7})$/
  return regex.test(cleaned)
}

/**
 * Valida si una contraseña cumple requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const isValidPassword = (password) => {
  const errors = []
  
  if (!password) {
    return { isValid: false, errors: ['La contraseña es requerida'] }
  }
  
  if (password.length < 8) errors.push('Mínimo 8 caracteres')
  
  return { isValid: errors.length === 0, errors }
}

/**
 * Valida si un campo está vacío
 * @param {any} value - Valor a validar
 * @returns {boolean}
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Valida un formulario según reglas
 * @param {object} values - Valores del formulario
 * @param {object} rules - Reglas de validación
 * @returns {object} Errores encontrados
 */
export const validateForm = (values, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field]
    const value = values[field]
    
    if (fieldRules.required && isEmpty(value)) {
      errors[field] = fieldRules.requiredMessage || 'Este campo es requerido'
      return
    }
    
    if (fieldRules.email && value && !isValidEmail(value)) {
      errors[field] = 'Email inválido'
      return
    }
    
    if (fieldRules.cedula && value && !isValidCedula(value)) {
      errors[field] = 'Cédula inválida'
      return
    }
    
    if (fieldRules.phone && value && !isValidPhone(value)) {
      errors[field] = 'Teléfono inválido'
      return
    }
    
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `Mínimo ${fieldRules.minLength} caracteres`
      return
    }
    
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `Máximo ${fieldRules.maxLength} caracteres`
      return
    }
    
    if (fieldRules.min && value && Number(value) < fieldRules.min) {
      errors[field] = `Valor mínimo: ${fieldRules.min}`
      return
    }
    
    if (fieldRules.max && value && Number(value) > fieldRules.max) {
      errors[field] = `Valor máximo: ${fieldRules.max}`
      return
    }
    
    if (fieldRules.custom && !fieldRules.custom(value, values)) {
      errors[field] = fieldRules.customMessage || 'Valor inválido'
    }
  })
  
  return errors
}
