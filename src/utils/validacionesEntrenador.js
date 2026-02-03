/**
 * Validaciones para Entrenadores
 * Mantiene consistencia con las validaciones del backend
 */

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

export const VALIDACIONES_ENTRENADOR = {
  ESPECIALIDAD: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  CLUB_ASIGNADO: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
};

// ============================================================================
// MENSAJES DE ERROR
// ============================================================================

export const MENSAJES_ERROR_ENTRENADOR = {
  ESPECIALIDAD: {
    REQUERIDO: 'La especialidad es requerida',
    MINIMO: `La especialidad debe tener al menos ${VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MIN_LENGTH} caracteres`,
    MAXIMO: `La especialidad no puede exceder ${VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MAX_LENGTH} caracteres`,
    SOLO_ESPACIOS: 'La especialidad no puede contener solo espacios en blanco',
  },
  CLUB_ASIGNADO: {
    REQUERIDO: 'El club asignado es requerido',
    MINIMO: `El club asignado debe tener al menos ${VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MIN_LENGTH} caracteres`,
    MAXIMO: `El club asignado no puede exceder ${VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MAX_LENGTH} caracteres`,
    SOLO_ESPACIOS: 'El club asignado no puede contener solo espacios en blanco',
  },
};

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida la especialidad
 * @param {string} especialidad - Valor de especialidad
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarEspecialidad = (especialidad) => {
  if (!especialidad) return MENSAJES_ERROR_ENTRENADOR.ESPECIALIDAD.REQUERIDO;
  
  const trimmed = especialidad.trim();
  if (!trimmed) return MENSAJES_ERROR_ENTRENADOR.ESPECIALIDAD.SOLO_ESPACIOS;
  if (trimmed.length < VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MIN_LENGTH) 
    return MENSAJES_ERROR_ENTRENADOR.ESPECIALIDAD.MINIMO;
  if (trimmed.length > VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MAX_LENGTH) 
    return MENSAJES_ERROR_ENTRENADOR.ESPECIALIDAD.MAXIMO;
  
  return null;
};

/**
 * Valida el club asignado
 * @param {string} clubAsignado - Valor del club asignado
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarClubAsignado = (clubAsignado) => {
  if (!clubAsignado) return MENSAJES_ERROR_ENTRENADOR.CLUB_ASIGNADO.REQUERIDO;
  
  const trimmed = clubAsignado.trim();
  if (!trimmed) return MENSAJES_ERROR_ENTRENADOR.CLUB_ASIGNADO.SOLO_ESPACIOS;
  if (trimmed.length < VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MIN_LENGTH) 
    return MENSAJES_ERROR_ENTRENADOR.CLUB_ASIGNADO.MINIMO;
  if (trimmed.length > VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MAX_LENGTH) 
    return MENSAJES_ERROR_ENTRENADOR.CLUB_ASIGNADO.MAXIMO;
  
  return null;
};

/**
 * Valida todos los datos del entrenador
 * @param {Object} datos - Objeto con datos: especialidad, club_asignado
 * @returns {Object} - Objeto con errores por campo o vacío si todo es válido
 */
export const validarDatosEntrenador = (datos) => {
  const errores = {};
  
  const errorEspecialidad = validarEspecialidad(datos.especialidad);
  if (errorEspecialidad) errores.especialidad = errorEspecialidad;
  
  const errorClubAsignado = validarClubAsignado(datos.club_asignado);
  if (errorClubAsignado) errores.club_asignado = errorClubAsignado;
  
  return errores;
};

// ============================================================================
// TOOLTIPS Y AYUDAS
// ============================================================================

export const TOOLTIPS_ENTRENADOR = {
  ESPECIALIDAD: `Especialidad del entrenador (ej: Táctica, Preparación Física, Técnica). ${VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MIN_LENGTH}-${VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MAX_LENGTH} caracteres.`,
  CLUB_ASIGNADO: `Club al que está asignado el entrenador (ej: Club UNL, Deportivo Loja). ${VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MIN_LENGTH}-${VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MAX_LENGTH} caracteres.`,
};

export default {
  VALIDACIONES_ENTRENADOR,
  MENSAJES_ERROR_ENTRENADOR,
  validarEspecialidad,
  validarClubAsignado,
  validarDatosEntrenador,
  TOOLTIPS_ENTRENADOR,
};
