/**
 * Componente InscripcionForm
 * Formulario completo de creación/edición de inscripciones
 * Compatible con backend Django - Estructura: persona + atleta + inscripcion
 */

import { useState, useEffect, useCallback } from 'react'
import { FiSave, FiX, FiLoader, FiAlertCircle, FiUser, FiHeart, FiUsers, FiFileText, FiLock, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { Button, Card } from '../common'
import { isValidEmail, isValidCedula, isValidPhone } from '../../utils/validators'
import apiClient from '../../api/apiClient'
import { ENDPOINTS } from '../../config/api.config'

// ============================================================================
// CONSTANTES - Deben coincidir EXACTAMENTE con el backend (models.py)
// ============================================================================
const TIPO_INSCRIPCION = {
  MENOR_EDAD: 'MENOR_EDAD',  // String exacto que espera el backend
  MAYOR_EDAD: 'MAYOR_EDAD',  // String exacto que espera el backend
}

const EDAD_MAYORIA = 18 // Edad legal para ser considerado mayor de edad

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

// Función para calcular edad desde fecha de nacimiento
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad >= 0 ? edad : null
}

/**
 * Determina automáticamente el tipo de inscripción basado en la edad
 * SMART: El sistema calcula esto, el usuario no puede modificarlo
 */
const determinarTipoInscripcion = (edad) => {
  const edadNum = typeof edad === 'string' ? parseInt(edad, 10) : edad
  if (isNaN(edadNum) || edadNum === null) return TIPO_INSCRIPCION.MAYOR_EDAD // Default
  return edadNum < EDAD_MAYORIA ? TIPO_INSCRIPCION.MENOR_EDAD : TIPO_INSCRIPCION.MAYOR_EDAD
}

/**
 * Verifica si el atleta es menor de edad
 */
const esMenorDeEdad = (edad) => {
  const edadNum = typeof edad === 'string' ? parseInt(edad, 10) : edad
  return !isNaN(edadNum) && edadNum < EDAD_MAYORIA
}

// Fecha de hoy para restricciones
const TODAY = new Date().toISOString().split('T')[0]

const InscripcionForm = ({ 
  inscripcion = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [submitError, setSubmitError] = useState(null)
  const [duplicateError, setDuplicateError] = useState(null) // Error específico de cédula duplicada
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para validación en tiempo real de cédula
  const [isCheckingCedula, setIsCheckingCedula] = useState(false)
  const [cedulaError, setCedulaError] = useState(null)
  const [cedulaValid, setCedulaValid] = useState(false)
  
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
        const response = await apiClient.get(`${ENDPOINTS.INSCRIPCIONES}verificar-cedula/`, {
          params: { dni: cedula }
        })
        
        if (response.data?.existe) {
          setCedulaError('⚠️ Este atleta ya tiene una inscripción activa.')
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

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target
    let updates = { [name]: value }

    // REGLA: Restricción estricta de solo números
    const numericFields = ['identification', 'phono', 'cedula_representante', 'telefono_representante']
    if (numericFields.includes(name)) {
      updates[name] = value.replace(/\D/g, '') // Eliminar todo lo que no sea dígito
    }
    
    // SMART: Auto-calcular edad y tipo
    if (name === 'fecha_nacimiento' && value) {
      const edadCalculada = calcularEdad(value)
      if (edadCalculada !== null) {
        updates.edad = edadCalculada.toString()
        const nuevoTipo = determinarTipoInscripcion(edadCalculada)
        updates.tipo_inscripcion = nuevoTipo
        
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
  
  const isMinor = esMenorDeEdad(formData.edad)
  const tieneEdadCalculada = formData.edad !== '' && formData.edad !== null

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}
    
    // === PERSONA ===
    if (!formData.firts_name.trim()) newErrors.firts_name = 'El nombre es requerido'
    if (!formData.last_name.trim()) newErrors.last_name = 'El apellido es requerido'
    
    if (!formData.identification.trim()) {
      newErrors.identification = 'La identificación es requerida'
    } else if (formData.identification.trim().length !== 10) {
      newErrors.identification = 'Debe tener exactamente 10 dígitos'
    }
    
    if (formData.phono?.trim() && formData.phono.trim().length !== 10) {
      newErrors.phono = 'Debe tener exactamente 10 dígitos'
    }
    
    // === ATLETA ===
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'Fecha requerida'
    } else {
      const edadCalculada = calcularEdad(formData.fecha_nacimiento)
      if (edadCalculada < 5 || edadCalculada > 80) {
        newErrors.fecha_nacimiento = 'La edad debe estar entre 5 y 80 años'
      }
    }
    
    if (!formData.sexo) newErrors.sexo = 'El sexo es requerido'
    
    // === INSCRIPCIÓN ===
    if (!formData.fecha_inscripcion) newErrors.fecha_inscripcion = 'Fecha requerida'
    
    // === REPRESENTANTE (Solo menores) ===
    if (isMinor) {
      if (!formData.nombre_representante?.trim()) newErrors.nombre_representante = 'Requerido para menores'
      
      if (!formData.cedula_representante?.trim()) {
        newErrors.cedula_representante = 'Requerido'
      } else if (formData.cedula_representante.trim().length !== 10) {
        newErrors.cedula_representante = 'Debe tener 10 dígitos'
      }
      
      if (!formData.parentesco_representante?.trim()) newErrors.parentesco_representante = 'Requerido'
      
      if (!formData.telefono_representante?.trim()) {
        newErrors.telefono_representante = 'Requerido'
      } else if (formData.telefono_representante.trim().length !== 10) {
        newErrors.telefono_representante = 'Debe tener 10 dígitos'
      }
      
      if (formData.correo_representante?.trim() && !isValidEmail(formData.correo_representante.trim())) {
        newErrors.correo_representante = 'Email inválido'
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
          sexo: formData.sexo,
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
      
      // Capturar mensaje del backend 
      let errorMsg = "Ocurrió un error al guardar la inscripción."
      
      if (error.response && error.response.data) {
        // Prioridad al mensaje detallado del backend
        if (error.response.data.detail) {
          errorMsg = error.response.data.detail
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message
        } else if (typeof error.response.data === 'string') {
          errorMsg = error.response.data
        }
      } else if (error.message) {
        errorMsg = error.message
      }
      
      // Limpiar formato técnico: remover corchetes y comillas
      errorMsg = errorMsg
        .replace(/^\["?|"?\]$/g, '')
        .replace(/^\['|'\]$/g, '')
        .trim()
      
      // Detectar error de cédula duplicada (UC-004 Curso Alterno 8)
      const isDuplicateError = 
        errorMsg.toLowerCase().includes('ya se encuentra registrado') ||
        errorMsg.toLowerCase().includes('ya existe') ||
        errorMsg.toLowerCase().includes('identification') ||
        errorMsg.toLowerCase().includes('duplicado')
      
      if (isDuplicateError) {
        // Mensaje amigable para el usuario
        setDuplicateError('⚠️ Esta cédula ya cuenta con una inscripción activa. Por favor, verifique el número.')
        setSubmitError(null) // No mostrar el error genérico
      } else {
        setSubmitError(errorMsg)
        setDuplicateError(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar inputs
  const renderInput = (name, label, type = 'text', required = false, props = {}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        disabled={loading}
        className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[name] ? 'border-red-300' : 'border-gray-300'
        } ${props.readOnly ? 'bg-gray-100 text-gray-500' : ''}`}
        {...props}
      />
      {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
    </div>
  )

  const renderSelect = (name, label, options, required = false) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        disabled={loading}
        className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[name] ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <option value="">Seleccione...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
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
        disabled={loading}
        rows={rows}
        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* ALERTA CRÍTICA: Cédula duplicada - Centrada y prominente */}
      {duplicateError && (
        <div 
          className="bg-red-100 border-2 border-red-400 rounded-xl p-5 shadow-lg animate-pulse"
          style={{ width: '95%', margin: '10px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <FiAlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="text-lg font-bold text-red-800 mb-1">Cédula ya registrada</h4>
            <p className="text-sm text-red-700">{duplicateError}</p>
            <p className="text-xs text-red-500 mt-2">Corrija el número de cédula para continuar.</p>
          </div>
        </div>
      )}
      
      {/* Error general (otros errores) */}
      {submitError && !duplicateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="overflow-hidden break-words w-full">
            <h4 className="text-sm font-medium text-red-800">Error al guardar</h4>
            <p className="text-sm text-red-600 mt-1">{submitError}</p>
          </div>
        </div>
      )}

      {/* SECCIÓN: DATOS PERSONALES */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b">
          <FiUser className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput('firts_name', 'Nombres', 'text', true)}
          {renderInput('last_name', 'Apellidos', 'text', true)}
          
          {/* CÉDULA CON VALIDACIÓN EN TIEMPO REAL */}
          <div>
            <label htmlFor="identification" className="block text-sm font-medium text-gray-700 mb-1">
              Cédula/Identificación <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="identification"
                name="identification"
                value={formData.identification || ''}
                onChange={handleChange}
                disabled={loading}
                maxLength={10}
                placeholder="10 dígitos"
                className={`block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  cedulaError || errors.identification 
                    ? 'border-red-400 bg-red-50' 
                    : cedulaValid && formData.identification?.length === 10
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300'
                }`}
              />
              {/* Indicador de estado */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isCheckingCedula && (
                  <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                {!isCheckingCedula && cedulaError && (
                  <FiAlertCircle className="w-4 h-4 text-red-500" />
                )}
                {!isCheckingCedula && cedulaValid && formData.identification?.length === 10 && (
                  <FiCheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
            {/* Mensaje de ayuda/error */}
            {cedulaError ? (
              <p className="mt-1 text-sm text-red-600 font-medium">{cedulaError}</p>
            ) : errors.identification ? (
              <p className="mt-1 text-sm text-red-600">{errors.identification}</p>
            ) : isCheckingCedula ? (
              <p className="mt-1 text-sm text-blue-600">Verificando disponibilidad...</p>
            ) : cedulaValid && formData.identification?.length === 10 ? (
              <p className="mt-1 text-sm text-green-600">✓ Cédula disponible</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Ingrese los 10 dígitos</p>
            )}
          </div>
          
          {renderInput('phono', 'Teléfono', 'tel', false, { maxLength: 10, placeholder: '10 dígitos' })}
          <div className="md:col-span-2">
            {renderInput('direction', 'Dirección')}
          </div>
        </div>
      </Card>

      {/* SECCIÓN: DATOS DEL ATLETA */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b">
          <FiHeart className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Datos del Atleta</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderInput('fecha_nacimiento', 'Fecha de Nacimiento', 'date', true)}
          {/* Edad readOnly y estilizada */}
          {renderInput('edad', 'Edad', 'number', true, { readOnly: true, className: "bg-gray-100 cursor-not-allowed" })}
          {renderSelect('sexo', 'Sexo', [
            { value: 'M', label: 'Masculino' },
            { value: 'F', label: 'Femenino' },
            { value: 'O', label: 'Otro' },
          ], true)}
          {renderSelect('tipo_sangre', 'Tipo de Sangre', [
            { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
            { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
            { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
            { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
          ])}
        </div>
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Información Médica</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTextarea('alergias', 'Alergias')}
            {renderTextarea('enfermedades', 'Enfermedades')}
            {renderTextarea('medicamentos', 'Medicamentos')}
            {renderTextarea('lesiones', 'Lesiones')}
          </div>
        </div>
      </Card>

      {/* SECCIÓN: DATOS DE INSCRIPCIÓN */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b">
          <FiFileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Datos de Inscripción</h3>
        </div>
        
        {/* ALERTA AMARILLA PARA MENORES DE EDAD */}
        {isMinor && tieneEdadCalculada && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 animate-pulse">
            <FiAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-800">⚠️ Atleta menor de edad detectado</h4>
              <p className="text-sm text-amber-700 mt-1">
                Se requiere información del tutor o representante legal.
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput('fecha_inscripcion', 'Fecha de Inscripción', 'date', true, { max: TODAY })}
          
          {/* TIPO DE INSCRIPCIÓN - AUTOMÁTICO (Solo lectura) */}
          <div>
            <label htmlFor="tipo_inscripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Inscripción <span className="text-red-500">*</span>
              <span className="ml-2 inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <FiLock className="w-3 h-3 mr-1" />
                Auto
              </span>
            </label>
            <div className="relative">
              <select
                id="tipo_inscripcion"
                name="tipo_inscripcion"
                value={formData.tipo_inscripcion}
                disabled={true} // SIEMPRE deshabilitado
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
              >
                <option value={TIPO_INSCRIPCION.MAYOR_EDAD}>Mayor de Edad</option>
                <option value={TIPO_INSCRIPCION.MENOR_EDAD}>Menor de Edad</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                <FiLock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            {/* Indicador visual */}
            <div className={`mt-2 text-xs rounded-md px-2 py-1.5 ${
                isMinor ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
            }`}>
              <FiInfo className="inline w-3 h-3 mr-1" />
              {tieneEdadCalculada 
                ? (isMinor ? 'Requiere representante' : 'No requiere representante') 
                : 'Ingrese nacimiento'}
            </div>
          </div>
        </div>
      </Card>

      {/* SECCIÓN: REPRESENTANTE (solo menores) */}
      <div className={`transition-all duration-500 overflow-hidden ${
          isMinor ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {isMinor && (
          <Card className="p-4 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white mt-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FiUsers className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900">Datos del Representante Legal</h3>
              </div>
              <span className="text-xs font-medium text-white bg-purple-600 px-3 py-1 rounded-full">
                Obligatorio
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderInput('nombre_representante', 'Nombre Completo', 'text', true)}
              {renderInput('cedula_representante', 'Cédula', 'text', true, { maxLength: 10 })}
              {renderInput('parentesco_representante', 'Parentesco', 'text', true)}
              {renderInput('telefono_representante', 'Teléfono', 'tel', true, { maxLength: 10 })}
              {renderInput('correo_representante', 'Correo Electrónico', 'email')}
              {renderInput('ocupacion_representante', 'Ocupación')}
              <div className="md:col-span-2 lg:col-span-3">
                {renderInput('direccion_representante', 'Dirección')}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white py-4 z-10">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading || isSubmitting}>
          <FiX className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading || isSubmitting || !!cedulaError || isCheckingCedula} 
          loading={loading || isSubmitting}
        >
          {(loading || isSubmitting) ? (
            <><FiLoader className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
          ) : (
            <><FiSave className="w-4 h-4 mr-2" />{inscripcion ? 'Actualizar' : 'Crear'} Inscripción</>
          )}
        </Button>
      </div>
    </form>
  )
}

export default InscripcionForm