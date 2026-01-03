/**
 * Configuración general de la aplicación
 * Usa variables de entorno para mayor flexibilidad
 */

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Basketball Module',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: 'Sistema de gestión para módulo de Basketball',
}

// Configuración de paginación
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
}

// Tipos de inscripción (sincronizado con backend)
export const TIPO_INSCRIPCION = {
  NUEVO: 'NUEVO',
  RENOVACION: 'RENOVACION',
  TRANSFERENCIA: 'TRANSFERENCIA',
}

// Tipos de prueba física (sincronizado con backend)
export const TIPO_PRUEBA = {
  RESISTENCIA: 'RESISTENCIA',
  VELOCIDAD: 'VELOCIDAD',
  FUERZA: 'FUERZA',
  FLEXIBILIDAD: 'FLEXIBILIDAD',
  AGILIDAD: 'AGILIDAD',
  COORDINACION: 'COORDINACION',
}

// Opciones de sexo
export const SEXO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
]

// Tipos de sangre
export const TIPO_SANGRE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]
