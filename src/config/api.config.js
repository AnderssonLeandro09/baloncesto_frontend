/**
 * Configuración de la API
 * Centraliza las URLs y configuraciones del backend
 * Usa variables de entorno para mayor flexibilidad
 */

// URL base del backend Django (desde variable de entorno)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8023'

// Versión de la API o prefijo del módulo
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'basketball'

// URL completa de la API
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`

// Endpoints del backend organizados por módulo
export const ENDPOINTS = {
  // Atletas
  ATLETAS: '/atletas',
  
  // Entrenadores
  ENTRENADORES: '/entrenadores/',
  
  // Estudiantes de Vinculación
  ESTUDIANTES_VINCULACION: '/estudiantes-vinculacion/',
  
  // Grupos de Atletas
  GRUPOS_ATLETAS: '/grupos-atletas',
  
  // Inscripciones
  INSCRIPCIONES: '/inscripciones',
  
  // Pruebas Antropométricas
  PRUEBAS_ANTROPOMETRICAS: '/pruebas-antropometricas',
  
  // Pruebas Físicas
  PRUEBAS_FISICAS: '/pruebas-fisicas',

  // Perfil
  PROFILE: '/profile',
}

// Configuración de timeout para peticiones (desde variable de entorno)
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

// Modo debug
export const DEBUG = import.meta.env.VITE_DEBUG === 'true'
