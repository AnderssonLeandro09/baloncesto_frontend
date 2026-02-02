/**
 * Componente InscripcionForm
 * Formulario completo de creación/edición de inscripciones
 * Compatible con backend Django - Estructura: persona + atleta + inscripcion
 */

import { useState, useEffect, useCallback } from 'react'
import { FiSave, FiX, FiLoader, FiAlertCircle, FiUser, FiHeart, FiUsers, FiFileText, FiLock, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { Button, Card } from '../common'
import { isValidEmail, isValidPhone } from '../../utils/validators'
import { InscripcionService } from '../../api'
import { 
  MENSAJES_ERROR as INSCRIPCION_ERRORS,
  esMenorDeEdad as utilEsMenorDeEdad,
  calcularEdad as utilCalcularEdad,
  determinarTipoInscripcion as utilDeterminarTipoInscripcion,
  validarCedula,
  LIMITES_EDAD,
} from '../../utils/validacionesInscripcion'

// ============================================================================
// CONSTANTES - Deben coincidir EXACTAMENTE con el backend (models.py)
// ============================================================================
const TIPO_INSCRIPCION = {
  MENOR_EDAD: 'MENOR_EDAD',  // String exacto que espera el backend
  MAYOR_EDAD: 'MAYOR_EDAD',  // String exacto que espera el backend
}

const EDAD_MAYORIA = LIMITES_EDAD.MAYORIA // Usar la constante centralizada

// Campos del representante (para limpiar cuando es mayor de edad)
const CAMPOS_REPRESENTANTE = [
  'nombre_representante',
  'cedula_representante', 
  'parentesco_representante',
  'telefono_representante',
  'correo_representante',
  'direccion_representante',
  'ocupacion_representante',
]

// Función para sanitizar inputs y prevenir XSS
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

// Usar las funciones centralizadas de validacionesInscripcion
const calcularEdad = utilCalcularEdad
const determinarTipoInscripcion = utilDeterminarTipoInscripcion
const esMenorDeEdad = utilEsMenorDeEdad

// Fecha de hoy para restricciones
const TODAY = new Date().toISOString().split('T')[0]

const InscripcionForm = ({ 
  inscripcion = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  serverErrors = {}, // Errores del servidor para mostrar en campos específicos
  readOnly = false // Modo solo lectura para ver detalles
}) => {
  const [submitError, setSubmitError] = useState(null)
  const [duplicateError, setDuplicateError] = useState(null) // Error específico de cédula duplicada
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para validación en tiempo real de cédula (Atleta)
  const [isCheckingCedula, setIsCheckingCedula] = useState(false)
  const [cedulaError, setCedulaError] = useState(null)
  const [cedulaValid, setCedulaValid] = useState(false)

  // Estados para validación en tiempo real de cédula (Representante)
  const [isCheckingCedulaRep, setIsCheckingCedulaRep] = useState(false)
  const [cedulaRepError, setCedulaRepError] = useState(null)
  const [cedulaRepValid, setCedulaRepValid] = useState(false)

  // Estado para advertencias de formato (Solo mientras escribe)
  const [formatWarning, setFormatWarning] = useState({})

  const [cedulaRepInfo, setCedulaRepInfo] = useState(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    // === DATOS DE PERSONA ===
    firts_name: '',
    last_name: '',
    identification: '',
    phono: '',
    direction: '',
    
    // === DATOS DE ATLETA ===
    fecha_nacimiento: '',
    edad: '',
    sexo: '',
    sexo_otro: '', // Campo para texto personalizado cuando sexo = 'O'
    tipo_sangre: '',
    alergias: '',
    enfermedades: '',
    medicamentos: '',
    lesiones: '',
    
    // === DATOS DEL REPRESENTANTE ===
    nombre_representante: '',
    cedula_representante: '',
    parentesco_representante: '',
    telefono_representante: '',
    correo_representante: '',
    direccion_representante: '',
    ocupacion_representante: '',
    
    // === DATOS DE INSCRIPCIÓN ===
    fecha_inscripcion: new Date().toISOString().split('T')[0],
    tipo_inscripcion: 'MAYOR_EDAD',
  })

  // Variables derivadas del estado del formulario
  const isMinor = esMenorDeEdad(formData.edad)
  const tieneEdadCalculada = formData.edad !== '' && formData.edad !== null

  // Combinar errores locales con errores del servidor
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...serverErrors }))
    }
  }, [serverErrors])

  // Cargar datos existentes en modo edición
  useEffect(() => {
    if (inscripcion) {
      setFormData({
        // Persona
        firts_name: inscripcion?.persona?.firts_name || inscripcion?.persona?.first_name || '',
        last_name: inscripcion?.persona?.last_name || '',
        identification: inscripcion?.persona?.identification || inscripcion?.persona?.dni || '',
        phono: inscripcion?.persona?.phono || inscripcion?.persona?.phone || '',
        direction: inscripcion?.persona?.direction || inscripcion?.persona?.address || '',
        // Atleta
        fecha_nacimiento: inscripcion?.atleta?.fecha_nacimiento || '',
        edad: inscripcion?.atleta?.edad || '',
        sexo: inscripcion?.atleta?.sexo || '',
        sexo_otro: inscripcion?.atleta?.sexo_otro || '',
        tipo_sangre: inscripcion?.atleta?.tipo_sangre || '',
        alergias: inscripcion?.atleta?.alergias || '',
        enfermedades: inscripcion?.atleta?.enfermedades || '',
        medicamentos: inscripcion?.atleta?.medicamentos || '',
        lesiones: inscripcion?.atleta?.lesiones || '',
        // Representante
        nombre_representante: inscripcion?.atleta?.nombre_representante || '',
        cedula_representante: inscripcion?.atleta?.cedula_representante || '',
        parentesco_representante: inscripcion?.atleta?.parentesco_representante || '',
        telefono_representante: inscripcion?.atleta?.telefono_representante || '',
        correo_representante: inscripcion?.atleta?.correo_representante || '',
        direccion_representante: inscripcion?.atleta?.direccion_representante || '',
        ocupacion_representante: inscripcion?.atleta?.ocupacion_representante || '',
        // Inscripción
        fecha_inscripcion: inscripcion?.inscripcion?.fecha_inscripcion || new Date().toISOString().split('T')[0],
        tipo_inscripcion: inscripcion?.inscripcion?.tipo_inscripcion || 'MAYOR_EDAD',
      })
    }
  }, [inscripcion])

  // === VALIDACIÓN EN TIEMPO REAL DE CÉDULA DUPLICADA ===
  useEffect(() => {
    const cedula = formData.identification?.replace(/\D/g, '')
    
    // Si estamos editando, no validar la misma cédula
    const cedulaOriginal = inscripcion?.persona?.identification || inscripcion?.persona?.dni || ''
    if (cedula === cedulaOriginal && cedulaOriginal) {
      setCedulaError(null)
      setCedulaValid(true)
      return
    }
    
    // Solo validar cuando tenga exactamente 10 dígitos
    if (cedula?.length !== 10) {
      setCedulaError(null)
      setCedulaValid(false)
      return
    }
    
    // Debounce: esperar 500ms antes de hacer la petición
    const timeoutId = setTimeout(async () => {
      setIsCheckingCedula(true)
      try {
        // Usar el servicio centralizado en lugar de apiClient directamente
        const response = await InscripcionService.verificarCedula(cedula)
        
        if (response.existe) {
          setCedulaError(INSCRIPCION_ERRORS.CEDULA_DUPLICADA)
          setCedulaValid(false)
        } else {
          setCedulaError(null)
          setCedulaValid(true)
        }
      } catch (error) {
        console.error('Error verificando cédula:', error)
        // Si hay error de red, permitir continuar
        setCedulaError(null)
        setCedulaValid(true)
      } finally {
        setIsCheckingCedula(false)
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [formData.identification, inscripcion])

  // === VALIDACIÓN EN TIEMPO REAL DE CÉDULA REPRESENTANTE ===
  useEffect(() => {
    const cedula = formData.cedula_representante?.replace(/\D/g, '')
    
    // Solo validar si es menor de edad y tiene 10 dígitos
    if (!isMinor || cedula?.length !== 10) {
      setCedulaRepError(null)
      setCedulaRepValid(false)
      return
    }

    // No validar si es la misma que la del atleta (eso es un error de negocio)
    if (cedula === formData.identification) {
      setCedulaRepError("La cédula del representante no puede ser igual a la del atleta")
      setCedulaRepValid(false)
      return
    }
    
    const timeoutId = setTimeout(async () => {
      setIsCheckingCedulaRep(true)
      try {
        const response = await InscripcionService.verificarCedulaRepresentante(cedula)
        
        if (response.existe) {
          setCedulaRepInfo("Representante ya registrado en el sistema")
          setCedulaRepValid(true) 
        } else {
          setCedulaRepInfo("Nueva identificación de representante")
          setCedulaRepValid(true)
        }
      } catch (error) {
        console.error('Error verificando cédula representante:', error)
        setCedulaRepInfo(null)
        setCedulaRepValid(true)
      } finally {
        setIsCheckingCedulaRep(false)
      }
    }, 500)
    
    return () => {
      clearTimeout(timeoutId)
      setCedulaRepInfo(null)
    }
  }, [formData.cedula_representante, formData.identification, isMinor])

  // ============================================================================
  // REGEX DE VALIDACIÓN - Bloqueo de caracteres no permitidos
  // ============================================================================
  const REGEX_SOLO_LETRAS = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]*$/  // Solo letras, acentos y espacios
  const REGEX_SOLO_NUMEROS = /^[0-9]*$/                      // Solo dígitos

  // Manejar cambios en los campos con validación estricta
  const handleChange = (e) => {
    const { name, value } = e.target
    let updates = { [name]: value }

    // ========== VALIDACIÓN: SOLO LETRAS (Nombres, Apellidos, Parentesco) ==========
    const textOnlyFields = ['firts_name', 'last_name', 'nombre_representante', 'parentesco_representante']
    if (textOnlyFields.includes(name)) {
      if (value && !REGEX_SOLO_LETRAS.test(value)) {
        setFormatWarning(prev => ({ ...prev, [name]: "Solo se aceptan letras" }))
        return // Bloquea la entrada
      } else {
        setFormatWarning(prev => ({ ...prev, [name]: null }))
      }
    }

    // ========== VALIDACIÓN: SOLO NÚMEROS (Cédula, Teléfono) ==========
    const numericFields = ['identification', 'phono', 'cedula_representante', 'telefono_representante']
    if (numericFields.includes(name)) {
      if (value && !REGEX_SOLO_NUMEROS.test(value)) {
        setFormatWarning(prev => ({ ...prev, [name]: "Solo se aceptan números" }))
        return // Bloquea la entrada
      } else {
        setFormatWarning(prev => ({ ...prev, [name]: null }))
      }
      // Limitar a 10 caracteres máximo
      updates[name] = value.slice(0, 10)
    }

    // REGLA: Limpiar sexo_otro si cambia de "Otro" a otra opción
    if (name === 'sexo' && value !== 'O') {
      updates.sexo_otro = ''
    }

    // REGLA: Limitar sexo_otro a 20 caracteres
    if (name === 'sexo_otro') {
      updates[name] = value.slice(0, 20)
    }
    
    // SMART: Auto-calcular edad y tipo
    if (name === 'fecha_nacimiento' && value) {
      const edadCalculada = calcularEdad(value)
      if (edadCalculada !== null) {
        updates.edad = edadCalculada.toString()
        const nuevoTipo = determinarTipoInscripcion(edadCalculada)
        updates.tipo_inscripcion = nuevoTipo
        
        // Alerta inmediata de edad fuera de rango
        if (edadCalculada < LIMITES_EDAD.MINIMA || edadCalculada > LIMITES_EDAD.MAXIMA) {
          setFormatWarning(prev => ({ ...prev, fecha_nacimiento: `El atleta debe tener entre ${LIMITES_EDAD.MINIMA} y ${LIMITES_EDAD.MAXIMA} años` }))
        } else {
          setFormatWarning(prev => ({ ...prev, fecha_nacimiento: null }))
        }

        // Limpiar campos del representante si pasa a mayor de edad
        if (nuevoTipo === TIPO_INSCRIPCION.MAYOR_EDAD) {
          CAMPOS_REPRESENTANTE.forEach(campo => {
            updates[campo] = ''
          })
        }
      }
    }
    
    setFormData(prev => ({ ...prev, ...updates }))
    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    // Limpiar error de cédula duplicada cuando el usuario modifica la cédula
    if (name === 'identification') {
      setDuplicateError(null)
    }
    setSubmitError(null)
  }
  
  // Validar formulario
  const validateForm = () => {
    const newErrors = {}
    
    // === PERSONA - Usar mensajes centralizados ===
    if (!formData.firts_name.trim()) {
      newErrors.firts_name = INSCRIPCION_ERRORS.NOMBRE_REQUERIDO
    } else if (formData.firts_name.trim().length < 2) {
      newErrors.firts_name = INSCRIPCION_ERRORS.NOMBRE_MUY_CORTO
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = INSCRIPCION_ERRORS.APELLIDO_REQUERIDO
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = INSCRIPCION_ERRORS.APELLIDO_MUY_CORTO
    }
    
    // Validación de cédula: requerida y algoritmo módulo 10 (sincronizado con backend)
    if (!formData.identification.trim()) {
      newErrors.identification = INSCRIPCION_ERRORS.CEDULA_REQUERIDA
    } else if (!validarCedula(formData.identification.trim())) {
      newErrors.identification = INSCRIPCION_ERRORS.CEDULA_INVALIDA
    }
    
    // Teléfono: opcional, pero si se proporciona debe tener 10 dígitos
    if (formData.phono?.trim() && formData.phono.trim().length !== 10) {
      newErrors.phono = INSCRIPCION_ERRORS.TELEFONO_INVALIDO
    }
    
    // === ATLETA ===
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = INSCRIPCION_ERRORS.FECHA_NACIMIENTO_REQUERIDA
    } else {
      const edadCalculada = calcularEdad(formData.fecha_nacimiento)
      if (edadCalculada < LIMITES_EDAD.MINIMA || edadCalculada > LIMITES_EDAD.MAXIMA) {
        newErrors.fecha_nacimiento = INSCRIPCION_ERRORS.EDAD_FUERA_RANGO
      }
    }
    
    if (!formData.sexo) {
      newErrors.sexo = INSCRIPCION_ERRORS.SEXO_REQUERIDO
    } else if (formData.sexo === 'O' && !formData.sexo_otro?.trim()) {
      newErrors.sexo_otro = INSCRIPCION_ERRORS.SEXO_OTRO_REQUERIDO
    }
    
    // === INSCRIPCIÓN ===
    if (!formData.fecha_inscripcion) {
      newErrors.fecha_inscripcion = INSCRIPCION_ERRORS.FECHA_INSCRIPCION_REQUERIDA
    } else {
      // Validar que la fecha de inscripción no sea futura (sincronizado con backend)
      const fechaInscripcion = new Date(formData.fecha_inscripcion)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      if (fechaInscripcion > hoy) {
        newErrors.fecha_inscripcion = INSCRIPCION_ERRORS.FECHA_INSCRIPCION_FUTURA
      }
    }
    
    // === REPRESENTANTE (Solo menores) ===
    if (isMinor) {
      if (!formData.nombre_representante?.trim()) {
        newErrors.nombre_representante = INSCRIPCION_ERRORS.NOMBRE_REPRESENTANTE_REQUERIDO
      } else if (formData.nombre_representante.trim().length < 3) {
        newErrors.nombre_representante = INSCRIPCION_ERRORS.NOMBRE_REPRESENTANTE_MUY_CORTO
      }
      
      // Cédula representante: validación completa con algoritmo módulo 10
      if (!formData.cedula_representante?.trim()) {
        newErrors.cedula_representante = INSCRIPCION_ERRORS.CEDULA_REPRESENTANTE_REQUERIDA
      } else if (!validarCedula(formData.cedula_representante.trim())) {
        newErrors.cedula_representante = INSCRIPCION_ERRORS.CEDULA_REPRESENTANTE_INVALIDA
      }
      
      if (!formData.parentesco_representante?.trim()) {
        newErrors.parentesco_representante = INSCRIPCION_ERRORS.PARENTESCO_REQUERIDO
      } else if (formData.parentesco_representante.trim().length < 3) {
        newErrors.parentesco_representante = INSCRIPCION_ERRORS.PARENTESCO_MUY_CORTO
      }
      
      // Teléfono representante: requerido para menores, exactamente 10 dígitos
      if (!formData.telefono_representante?.trim()) {
        newErrors.telefono_representante = INSCRIPCION_ERRORS.TELEFONO_REPRESENTANTE_REQUERIDO
      } else if (formData.telefono_representante.trim().length !== 10) {
        newErrors.telefono_representante = INSCRIPCION_ERRORS.TELEFONO_REPRESENTANTE_INVALIDO
      }
      
      if (formData.correo_representante?.trim() && !isValidEmail(formData.correo_representante.trim())) {
        newErrors.correo_representante = INSCRIPCION_ERRORS.EMAIL_REPRESENTANTE_INVALIDO
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // === HANDLE SUBMIT CORREGIDO Y BLINDADO ===
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (isSubmitting || loading) return
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const cleanId = formData.identification.replace(/\D/g, '')

      // 2. CONSTRUCCIÓN DEL PAYLOAD SEGURO 
      const payload = {
        persona: {
          firts_name: sanitizeInput(formData.firts_name),
          last_name: sanitizeInput(formData.last_name),
          identification: cleanId,
          // Convertimos nulos a strings vacíos para evitar errores
          phono: formData.phono ? sanitizeInput(formData.phono) : "",
          direction: formData.direction ? sanitizeInput(formData.direction) : "",
        },
        atleta: {
          fecha_nacimiento: formData.fecha_nacimiento,
          edad: parseInt(formData.edad, 10) || 0,
          sexo: formData.sexo === 'O' ? sanitizeInput(formData.sexo_otro) : formData.sexo,
          // Campos opcionales como strings vacíos si no hay dato
          tipo_sangre: formData.tipo_sangre || "",
          alergias: formData.alergias ? sanitizeInput(formData.alergias) : "",
          enfermedades: formData.enfermedades ? sanitizeInput(formData.enfermedades) : "",
          medicamentos: formData.medicamentos ? sanitizeInput(formData.medicamentos) : "",
          lesiones: formData.lesiones ? sanitizeInput(formData.lesiones) : "",
          
          // Campos representante (vacíos si es mayor)
          nombre_representante: isMinor ? (formData.nombre_representante || "") : "",
          cedula_representante: isMinor ? (formData.cedula_representante || "") : "",
          parentesco_representante: isMinor ? (formData.parentesco_representante || "") : "",
          telefono_representante: isMinor ? (formData.telefono_representante || "") : "",
          correo_representante: isMinor ? (formData.correo_representante || "") : "",
          direccion_representante: isMinor ? (formData.direccion_representante || "") : "",
          ocupacion_representante: isMinor ? (formData.ocupacion_representante || "") : ""
        },
        inscripcion: {
          fecha_inscripcion: formData.fecha_inscripcion,
          tipo_inscripcion: formData.tipo_inscripcion,
        }
      }
      
      await onSubmit(payload)
      
    } catch (error) {
      console.error("Error al guardar inscripción:", error)
      
      // El error ya viene procesado con mensaje amigable del servicio
      let errorMsg = error.message || INSCRIPCION_ERRORS.ERROR_SERVIDOR
      
      // Detectar error de cédula duplicada
      const isDuplicateError = 
        errorMsg.toLowerCase().includes('ya se encuentra registrado') ||
        errorMsg.toLowerCase().includes('ya existe') ||
        errorMsg.toLowerCase().includes('duplicad') ||
        errorMsg.toLowerCase().includes('inscripción activa')
      
      if (isDuplicateError) {
        setDuplicateError(INSCRIPCION_ERRORS.CEDULA_DUPLICADA)
        setSubmitError(null)
      } else {
        setSubmitError(errorMsg)
        setDuplicateError(null)
      }
      
      // Si hay errores de campos específicos del servidor, mostrarlos
      if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...error.fieldErrors }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar inputs - COMPACTO
  const renderInput = (name, label, type = 'text', required = false, props = {}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && !readOnly && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        disabled={loading || readOnly}
        readOnly={readOnly}
        className={`block w-full px-2 py-1.5 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[name] ? 'border-red-300' : 'border-gray-300'
        } ${readOnly ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}`}
        {...props}
      />
      {!readOnly && formatWarning[name] && <p className="mt-0.5 text-xs text-amber-600 font-medium flex items-center"><FiAlertTriangle className="w-3 h-3 mr-1" />{formatWarning[name]}</p>}
      {!readOnly && errors[name] && !formatWarning[name] && <p className="mt-0.5 text-xs text-red-600">{errors[name]}</p>}
    </div>
  )

  const renderSelect = (name, label, options, required = false) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && !readOnly && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        disabled={loading || readOnly}
        className={`block w-full px-2 py-1.5 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[name] ? 'border-red-300' : 'border-gray-300'
        } ${readOnly ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}`}
      >
        <option value="">Seleccione...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {!readOnly && errors[name] && <p className="mt-0.5 text-xs text-red-600">{errors[name]}</p>}
    </div>
  )

  const renderTextarea = (name, label, rows = 2) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        disabled={loading || readOnly}
        readOnly={readOnly}
        rows={rows}
        className={`block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}`}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-1">
      {/* ALERTA CRÍTICA: Cédula duplicada - Centrada y prominente */}
      {duplicateError && (
        <div 
          className="bg-red-100 border-2 border-red-400 rounded-xl p-4 shadow-lg animate-pulse mb-4"
        >
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <FiAlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h4 className="text-base font-bold text-red-800 mb-1">Cédula ya registrada</h4>
            <p className="text-sm text-red-700">{duplicateError}</p>
            <p className="text-xs text-red-500 mt-1">Corrija el número de cédula para continuar.</p>
          </div>
        </div>
      )}
      
      {/* Error general (otros errores) */}
      {submitError && !duplicateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 mb-4">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="overflow-hidden break-words w-full">
            <h4 className="text-sm font-medium text-red-800">Error al guardar</h4>
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        </div>
      )}

      {/* LAYOUT GRID 2x2 - Filas alineadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* ===== FILA 1: DATOS PERSONALES + INFO MÉDICA ===== */}
        {/* SECCIÓN: DATOS PERSONALES */}
        <Card className="p-3">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
            <FiUser className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">Datos Personales</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderInput('firts_name', 'Nombres', 'text', true)}
            {renderInput('last_name', 'Apellidos', 'text', true)}
            
            {/* CÉDULA CON VALIDACIÓN EN TIEMPO REAL */}
            <div>
              <label htmlFor="identification" className="block text-sm font-medium text-gray-700 mb-1">
                Cédula {!readOnly && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="identification"
                  name="identification"
                  value={formData.identification || ''}
                    onChange={handleChange}
                    disabled={loading || readOnly}
                    readOnly={readOnly}
                    maxLength={10}
                    placeholder="10 dígitos"
                    className={`block w-full px-2 py-1.5 text-sm pr-8 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      readOnly 
                        ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-300'
                        : cedulaError || errors.identification 
                          ? 'border-red-400 bg-red-50' 
                          : cedulaValid && formData.identification?.length === 10
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300'
                    }`}
                  />
                  {!readOnly && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      {isCheckingCedula && <FiLoader className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                      {!isCheckingCedula && cedulaError && <FiAlertCircle className="w-3.5 h-3.5 text-red-500" />}
                      {!isCheckingCedula && cedulaValid && formData.identification?.length === 10 && <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                  )}
                </div>
                {!readOnly && (cedulaError ? (
                  <p className="mt-0.5 text-xs text-red-600 font-medium">{cedulaError}</p>
                ) : errors.identification ? (
                  <p className="mt-0.5 text-xs text-red-600">{errors.identification}</p>
                ) : isCheckingCedula ? (
                  <p className="mt-0.5 text-xs text-blue-600">Verificando...</p>
                ) : cedulaValid && formData.identification?.length === 10 ? (
                  <p className="mt-0.5 text-xs text-green-600">✓ Disponible</p>
                ) : null)}
              </div>
              
              {renderInput('phono', 'Teléfono', 'tel', false, { maxLength: 10, placeholder: '10 dígitos' })}
              <div className="col-span-2">
                {renderInput('direction', 'Dirección')}
              </div>
            </div>
          </Card>

        {/* SECCIÓN: INFORMACIÓN MÉDICA (va a la derecha de Datos Personales) */}
        <Card className="p-3">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
            <FiHeart className="w-4 h-4 text-pink-500" />
            <h3 className="text-base font-semibold text-gray-900">Información Médica</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderTextarea('alergias', 'Alergias', 2)}
            {renderTextarea('enfermedades', 'Enfermedades', 2)}
            {renderTextarea('medicamentos', 'Medicamentos', 2)}
            {renderTextarea('lesiones', 'Lesiones', 2)}
          </div>
        </Card>

        {/* ===== FILA 2: DATOS ATLETA + DATOS INSCRIPCIÓN ===== */}
        {/* SECCIÓN: DATOS DEL ATLETA */}
        <Card className="p-3">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
            <FiHeart className="w-4 h-4 text-red-500" />
            <h3 className="text-base font-semibold text-gray-900">Datos del Atleta</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderInput('fecha_nacimiento', 'Fecha Nacimiento', 'date', true)}
            {renderInput('edad', 'Edad', 'number', true, { readOnly: true, className: "bg-gray-100 cursor-not-allowed" })}
            
            {/* CAMPO SEXO CON LÓGICA CONDICIONAL */}
            <div className={formData.sexo === 'O' ? 'col-span-2' : ''}>
              <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-1">
                Sexo {!readOnly && <span className="text-red-500">*</span>}
              </label>
              <div className={`flex gap-2 ${formData.sexo === 'O' ? 'flex-row' : ''}`}>
                <select
                  id="sexo"
                  name="sexo"
                  value={formData.sexo || ''}
                  onChange={handleChange}
                  disabled={loading || readOnly}
                  className={`${formData.sexo === 'O' ? 'w-1/3' : 'w-full'} px-2 py-1.5 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sexo ? 'border-red-300' : 'border-gray-300'
                  } ${readOnly ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}`}
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                
                {/* Input condicional para "Otro" */}
                {formData.sexo === 'O' && (
                  <input
                    type="text"
                    name="sexo_otro"
                    value={formData.sexo_otro || ''}
                    onChange={handleChange}
                    placeholder="Especificar (máx. 20 car.)"
                    maxLength={20}
                    disabled={loading || readOnly}
                    readOnly={readOnly}
                    className={`flex-1 px-2 py-1.5 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.sexo_otro ? 'border-red-300' : 'border-gray-300'
                    } ${readOnly ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}`}
                  />
                )}
              </div>
              {!readOnly && errors.sexo && <p className="mt-0.5 text-xs text-red-600">{errors.sexo}</p>}
              {!readOnly && errors.sexo_otro && <p className="mt-0.5 text-xs text-red-600">{errors.sexo_otro}</p>}
            </div>
            
            {formData.sexo !== 'O' && renderSelect('tipo_sangre', 'Tipo Sangre', [
              { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
              { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
              { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
            ])}
          </div>
          
          {/* Tipo sangre en fila separada cuando sexo es "Otro" */}
          {formData.sexo === 'O' && (
            <div className="mt-3">
              {renderSelect('tipo_sangre', 'Tipo Sangre', [
                { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
              ])}
            </div>
          )}
        </Card>

        {/* SECCIÓN: DATOS DE INSCRIPCIÓN (va a la derecha de Datos del Atleta) */}
        <Card className="p-3">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
            <FiFileText className="w-4 h-4 text-green-600" />
            <h3 className="text-base font-semibold text-gray-900">Datos de Inscripción</h3>
          </div>
          
          {/* ALERTA AMARILLA PARA MENORES DE EDAD */}
          {isMinor && tieneEdadCalculada && (
            <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start space-x-2">
              <FiAlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-800">⚠️ Menor de edad</h4>
                <p className="text-xs text-amber-700">Se requiere representante legal.</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {renderInput('fecha_inscripcion', 'Fecha Inscripción', 'date', true, { max: TODAY })}
            
            {/* TIPO DE INSCRIPCIÓN - AUTOMÁTICO */}
            <div>
              <label htmlFor="tipo_inscripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo 
                <span className="ml-1 inline-flex items-center text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                  <FiLock className="w-2.5 h-2.5 mr-0.5" />Auto
                </span>
              </label>
              <div className="relative">
                <select
                  id="tipo_inscripcion"
                  name="tipo_inscripcion"
                  value={formData.tipo_inscripcion}
                  disabled={true}
                  className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value={TIPO_INSCRIPCION.MAYOR_EDAD}>Mayor de Edad</option>
                  <option value={TIPO_INSCRIPCION.MENOR_EDAD}>Menor de Edad</option>
                </select>
              </div>
              <div className={`mt-1 text-xs rounded px-1.5 py-1 ${
                  isMinor ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
              }`}>
                <FiInfo className="inline w-3 h-3 mr-0.5" />
                {tieneEdadCalculada 
                  ? (isMinor ? 'Requiere representante' : 'No requiere representante') 
                  : 'Ingrese fecha nacimiento'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECCIÓN: REPRESENTANTE (solo menores) - ANCHO COMPLETO */}
      <div className={`transition-all duration-500 overflow-hidden ${
          isMinor ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
      }`}>
        {isMinor && (
          <Card className="p-3 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-200">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 rounded-full">
                  <FiUsers className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-base font-semibold text-purple-900">Representante Legal</h3>
              </div>
              <span className="text-xs font-medium text-white bg-purple-600 px-2 py-0.5 rounded-full">
                Obligatorio
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {renderInput('nombre_representante', 'Nombre Completo', 'text', true)}
              
              {/* CÉDULA REPRESENTANTE CON VALIDACIÓN EN TIEMPO REAL */}
              <div>
                <label htmlFor="cedula_representante" className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula {!readOnly && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cedula_representante"
                    name="cedula_representante"
                    value={formData.cedula_representante || ''}
                    onChange={handleChange}
                    disabled={loading || readOnly}
                    readOnly={readOnly}
                    maxLength={10}
                    placeholder="10 dígitos"
                    className={`block w-full px-2 py-1.5 text-sm pr-8 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      readOnly
                        ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-300'
                        : cedulaRepError || errors.cedula_representante || formatWarning.cedula_representante
                          ? 'border-red-400 bg-red-50' 
                          : cedulaRepValid && formData.cedula_representante?.length === 10
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300'
                    }`}
                  />
                  {!readOnly && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      {isCheckingCedulaRep && <FiLoader className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                      {!isCheckingCedulaRep && (cedulaRepError || formatWarning.cedula_representante) && <FiAlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                      {!isCheckingCedulaRep && cedulaRepValid && formData.cedula_representante?.length === 10 && !cedulaRepError && <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                  )}
                </div>
                {!readOnly && (formatWarning.cedula_representante ? (
                  <p className="mt-0.5 text-xs text-amber-600 font-medium">{formatWarning.cedula_representante}</p>
                ) : cedulaRepError ? (
                  <p className="mt-0.5 text-xs text-red-600 font-medium">{cedulaRepError}</p>
                ) : errors.cedula_representante ? (
                  <p className="mt-0.5 text-xs text-red-600">{errors.cedula_representante}</p>
                ) : isCheckingCedulaRep ? (
                  <p className="mt-0.5 text-xs text-blue-600">Verificando...</p>
                ) : cedulaRepInfo ? (
                  <p className="mt-0.5 text-xs text-green-600 font-medium">✓ {cedulaRepInfo}</p>
                ) : cedulaRepValid && formData.cedula_representante?.length === 10 ? (
                  <p className="mt-0.5 text-xs text-green-600">✓ Cédula validada</p>
                ) : null)}
              </div>

              {renderInput('parentesco_representante', 'Parentesco', 'text', true)}
              {renderInput('telefono_representante', 'Teléfono', 'tel', true, { maxLength: 10 })}
              {renderInput('correo_representante', 'Correo', 'email')}
              {renderInput('ocupacion_representante', 'Ocupación')}
              <div className="col-span-2">
                {renderInput('direccion_representante', 'Dirección')}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-200 sticky bottom-0 bg-white py-3 z-10">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading || isSubmitting}>
          <FiX className="w-4 h-4 mr-2" />
          {readOnly ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!readOnly && (
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || isSubmitting || !!cedulaError || !!cedulaRepError || isCheckingCedula || isCheckingCedulaRep} 
            loading={loading || isSubmitting}
          >
            {(loading || isSubmitting) ? (
              <><FiLoader className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
            ) : (
              <><FiSave className="w-4 h-4 mr-2" />{inscripcion ? 'Actualizar' : 'Crear'} Inscripción</>
            )}
          </Button>
        )}
      </div>
    </form>
  )
}

export default InscripcionForm