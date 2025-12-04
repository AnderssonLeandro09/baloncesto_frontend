/**
 * Constantes globales de la aplicación
 */

// Estados de respuesta HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
}

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no existe.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  SERVER_ERROR: 'Error del servidor. Intenta nuevamente más tarde.',
  DEFAULT: 'Ha ocurrido un error inesperado.',
}

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  CREATED: 'Registro creado exitosamente.',
  UPDATED: 'Registro actualizado exitosamente.',
  DELETED: 'Registro eliminado exitosamente.',
}

// Teclas de almacenamiento local
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'app_theme',
  SIDEBAR: 'sidebar_state',
}

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  ATLETAS: '/atletas',
  ENTRENADORES: '/entrenadores',
  GRUPOS: '/grupos',
  INSCRIPCIONES: '/inscripciones',
  PRUEBAS_ANTROPOMETRICAS: '/pruebas-antropometricas',
  PRUEBAS_FISICAS: '/pruebas-fisicas',
  ESTUDIANTES: '/estudiantes-vinculacion',
}
