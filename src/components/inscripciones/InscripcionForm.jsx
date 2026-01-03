/**
 * Componente InscripcionForm
 * Formulario completo de creación/edición de inscripciones
 * Compatible con backend Django - Estructura: persona + atleta + inscripcion
 * 
 * LÓGICA SMART:
 * - Detecta automáticamente el tipo de inscripción basado en la edad
 * - El campo tipo_inscripcion está DESHABILITADO (el sistema lo calcula)
 * - Muestra/oculta campos de representante con animación suave
 * - Envía valores "MENOR_EDAD" o "MAYOR_EDAD" al backend (no texto legible)
 */

import { useState, useEffect } from 'react'
import { FiSave, FiX, FiLoader, FiAlertCircle, FiUser, FiHeart, FiUsers, FiFileText, FiLock, FiInfo, FiAlertTriangle } from 'react-icons/fi'
import { Button, Card } from '../common'
import { isValidEmail, isValidCedula, isValidPhone, isValidPassword } from '../../utils/validators'

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
 * @param {number|string} edad - Edad del atleta
 * @returns {string} MENOR_EDAD o MAYOR_EDAD
 */
const determinarTipoInscripcion = (edad) => {
  const edadNum = typeof edad === 'string' ? parseInt(edad, 10) : edad
  if (isNaN(edadNum) || edadNum === null) return TIPO_INSCRIPCION.MAYOR_EDAD // Default
  return edadNum < EDAD_MAYORIA ? TIPO_INSCRIPCION.MENOR_EDAD : TIPO_INSCRIPCION.MAYOR_EDAD
}

/**
 * Verifica si el atleta es menor de edad
 * @param {number|string} edad - Edad del atleta  
 * @returns {boolean}
 */
const esMenorDeEdad = (edad) => {
  const edadNum = typeof edad === 'string' ? parseInt(edad, 10) : edad
  return !isNaN(edadNum) && edadNum < EDAD_MAYORIA
}

const InscripcionForm = ({ 
  inscripcion = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [submitError, setSubmitError] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false) // Protección contra doble envío
  
  // Estado del formulario con todos los campos necesarios
  const [formData, setFormData] = useState({
    // === DATOS DE PERSONA ===
    firts_name: '',
    last_name: '',
    identification: '',
    email: '',
    password: '',
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
    
    // === DATOS DEL REPRESENTANTE (para menores) ===
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
        email: inscripcion?.persona?.email || '',
        password: '',
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

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target
    let updates = { [name]: value }
    
    // SMART: Auto-calcular edad y tipo de inscripción cuando cambia la fecha de nacimiento
    if (name === 'fecha_nacimiento' && value) {
      const edadCalculada = calcularEdad(value)
      if (edadCalculada !== null) {
        updates.edad = edadCalculada.toString()
        // AUTOMÁTICO: El tipo de inscripción se determina por la edad
        const nuevoTipo = determinarTipoInscripcion(edadCalculada)
        updates.tipo_inscripcion = nuevoTipo
        
        // SMART: Si pasa a ser MAYOR_EDAD, limpiar campos del representante
        if (nuevoTipo === TIPO_INSCRIPCION.MAYOR_EDAD) {
          CAMPOS_REPRESENTANTE.forEach(campo => {
            updates[campo] = ''
          })
        }
      }
    }
    
    // SMART: Si el usuario modifica manualmente la edad, recalcular tipo
    if (name === 'edad' && value) {
      const nuevoTipo = determinarTipoInscripcion(value)
      updates.tipo_inscripcion = nuevoTipo
      
      // Limpiar campos del representante si es mayor de edad
      if (nuevoTipo === TIPO_INSCRIPCION.MAYOR_EDAD) {
        CAMPOS_REPRESENTANTE.forEach(campo => {
          updates[campo] = ''
        })
      }
    }
    
    setFormData(prev => ({ ...prev, ...updates }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    setSubmitError(null)
  }
  
  // Computed: ¿Es menor de edad? (para mostrar/ocultar secciones)
  const isMinor = esMenorDeEdad(formData.edad)
  
  // Computed: ¿Tiene fecha de nacimiento válida?
  const tieneEdadCalculada = formData.edad !== '' && formData.edad !== null

  // Validar formulario con reglas robustas
  const validateForm = () => {
    const newErrors = {}
    
    // === VALIDACIONES DE PERSONA ===
    if (!formData.firts_name.trim()) {
      newErrors.firts_name = 'El nombre es requerido'
    } else if (formData.firts_name.trim().length < 2) {
      newErrors.firts_name = 'El nombre debe tener al menos 2 caracteres'
    } else if (formData.firts_name.trim().length > 100) {
      newErrors.firts_name = 'El nombre no puede exceder 100 caracteres'
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido'
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'El apellido debe tener al menos 2 caracteres'
    } else if (formData.last_name.trim().length > 100) {
      newErrors.last_name = 'El apellido no puede exceder 100 caracteres'
    }
    
    if (!formData.identification.trim()) {
      newErrors.identification = 'La identificación es requerida'
    } else if (!isValidCedula(formData.identification.trim())) {
      newErrors.identification = 'Cédula ecuatoriana inválida (10 dígitos)'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = 'Formato de email inválido'
    }
    
    // Validación de teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.phono?.trim() && !isValidPhone(formData.phono.trim())) {
      newErrors.phono = 'Formato de teléfono inválido'
    }
    
    // === VALIDACIÓN DE PASSWORD (con función mejorada) ===
    if (!inscripcion) {
      const passwordValidation = isValidPassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] // Mostrar primer error
      }
    }
    
    // === VALIDACIONES DE ATLETA ===
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida'
    } else {
      const fechaNac = new Date(formData.fecha_nacimiento)
      const hoy = new Date()
      const edadCalculada = calcularEdad(formData.fecha_nacimiento)
      
      if (fechaNac > hoy) {
        newErrors.fecha_nacimiento = 'La fecha no puede ser futura'
      } else if (edadCalculada < 5 || edadCalculada > 80) {
        newErrors.fecha_nacimiento = 'La edad debe estar entre 5 y 80 años'
      }
    }
    
    if (!formData.edad) {
      newErrors.edad = 'La edad es requerida'
    } else {
      const edad = parseInt(formData.edad, 10)
      if (isNaN(edad) || edad < 5 || edad > 80) {
        newErrors.edad = 'La edad debe estar entre 5 y 80 años'
      }
      // Verificar coherencia con fecha de nacimiento
      if (formData.fecha_nacimiento) {
        const edadCalculada = calcularEdad(formData.fecha_nacimiento)
        if (Math.abs(edad - edadCalculada) > 1) {
          newErrors.edad = `La edad no coincide con la fecha de nacimiento (debería ser ~${edadCalculada})`
        }
      }
    }
    
    if (!formData.sexo) newErrors.sexo = 'El sexo es requerido'
    
    // === VALIDACIONES DE INSCRIPCIÓN ===
    if (!formData.fecha_inscripcion) {
      newErrors.fecha_inscripcion = 'La fecha de inscripción es requerida'
    } else {
      const fechaInsc = new Date(formData.fecha_inscripcion)
      const hoy = new Date()
      const hace30Dias = new Date()
      hace30Dias.setDate(hoy.getDate() - 30)
      
      if (fechaInsc > hoy) {
        newErrors.fecha_inscripcion = 'La fecha no puede ser futura'
      } else if (fechaInsc < hace30Dias) {
        newErrors.fecha_inscripcion = 'La fecha no puede ser anterior a 30 días'
      }
    }
    
    if (!formData.tipo_inscripcion) newErrors.tipo_inscripcion = 'El tipo es requerido'
    
    // === VALIDACIONES DE REPRESENTANTE (obligatorias para menores) ===
    // Usar la función helper en lugar de comparar directamente con el string
    const esAtletaMenor = esMenorDeEdad(formData.edad)
    if (esAtletaMenor) {
      if (!formData.nombre_representante?.trim()) {
        newErrors.nombre_representante = 'El nombre del representante es requerido para menores'
      }
      if (!formData.cedula_representante?.trim()) {
        newErrors.cedula_representante = 'La cédula del representante es requerida'
      } else if (!isValidCedula(formData.cedula_representante.trim())) {
        newErrors.cedula_representante = 'Cédula del representante inválida'
      }
      if (!formData.parentesco_representante?.trim()) {
        newErrors.parentesco_representante = 'El parentesco es requerido'
      }
      if (!formData.telefono_representante?.trim()) {
        newErrors.telefono_representante = 'El teléfono del representante es requerido'
      } else if (!isValidPhone(formData.telefono_representante.trim())) {
        newErrors.telefono_representante = 'Teléfono del representante inválido'
      }
      // Validar email del representante si se proporciona
      if (formData.correo_representante?.trim() && !isValidEmail(formData.correo_representante.trim())) {
        newErrors.correo_representante = 'Email del representante inválido'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    
    // Protección contra doble envío
    if (isSubmitting || loading) return
    
    if (!validateForm()) return
    
    setIsSubmitting(true) // Bloquear envíos adicionales
    
    try {
      // CRÍTICO: Construir payload con estructura que espera el backend
      // Aplicar sanitización a todos los campos de texto para prevenir XSS
      const payload = {
        persona: {
          firts_name: sanitizeInput(formData.firts_name),
          last_name: sanitizeInput(formData.last_name),
          identification: sanitizeInput(formData.identification),
          email: formData.email.trim().toLowerCase(), // Email no necesita sanitización HTML
          phono: formData.phono ? sanitizeInput(formData.phono) : null,
          direction: formData.direction ? sanitizeInput(formData.direction) : null,
        },
        atleta: {
          fecha_nacimiento: formData.fecha_nacimiento,
          edad: parseInt(formData.edad, 10),
          sexo: formData.sexo,
          tipo_sangre: formData.tipo_sangre || null,
          alergias: formData.alergias ? sanitizeInput(formData.alergias) : null,
          enfermedades: formData.enfermedades ? sanitizeInput(formData.enfermedades) : null,
          medicamentos: formData.medicamentos ? sanitizeInput(formData.medicamentos) : null,
          lesiones: formData.lesiones ? sanitizeInput(formData.lesiones) : null,
        },
        inscripcion: {
          fecha_inscripcion: formData.fecha_inscripcion,
          tipo_inscripcion: formData.tipo_inscripcion,
        }
      }
      
      // Password solo en creación (no sanitizar para permitir caracteres especiales)
      if (!inscripcion && formData.password) {
        payload.persona.password = formData.password
      }
      
      // Datos del representante si es menor de edad (con sanitización)
      // Usar esMenorDeEdad() para consistencia
      if (esMenorDeEdad(formData.edad)) {
        payload.atleta.nombre_representante = formData.nombre_representante ? sanitizeInput(formData.nombre_representante) : null
        payload.atleta.cedula_representante = formData.cedula_representante ? sanitizeInput(formData.cedula_representante) : null
        payload.atleta.parentesco_representante = formData.parentesco_representante ? sanitizeInput(formData.parentesco_representante) : null
        payload.atleta.telefono_representante = formData.telefono_representante ? sanitizeInput(formData.telefono_representante) : null
        payload.atleta.correo_representante = formData.correo_representante?.trim().toLowerCase() || null
        payload.atleta.direccion_representante = formData.direccion_representante ? sanitizeInput(formData.direccion_representante) : null
        payload.atleta.ocupacion_representante = formData.ocupacion_representante ? sanitizeInput(formData.ocupacion_representante) : null
      }
      
      await onSubmit(payload)
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.error
        || error.message 
        || 'Error al guardar la inscripción'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false) // Desbloquear envío
    }
  }

  // Renderizar input
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
        }`}
        {...props}
      />
      {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
    </div>
  )

  // Renderizar select
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

  // Renderizar textarea
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
      {/* Error general */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
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
          {renderInput('identification', 'Cédula/Identificación', 'text', true)}
          {renderInput('email', 'Correo Electrónico', 'email', true)}
          {!inscripcion && renderInput('password', 'Contraseña', 'password', true, { minLength: 8 })}
          {renderInput('phono', 'Teléfono', 'tel')}
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
          {renderInput('edad', 'Edad', 'number', true, { min: 0, max: 100 })}
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
                Se requiere información del tutor o representante legal. Los campos aparecerán a continuación.
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput('fecha_inscripcion', 'Fecha de Inscripción', 'date', true)}
          
          {/* TIPO DE INSCRIPCIÓN - AUTOMÁTICO (Solo lectura) */}
          <div>
            <label htmlFor="tipo_inscripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Inscripción <span className="text-red-500">*</span>
              <span className="ml-2 inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <FiLock className="w-3 h-3 mr-1" />
                Calculado automáticamente
              </span>
            </label>
            <div className="relative">
              <select
                id="tipo_inscripcion"
                name="tipo_inscripcion"
                value={formData.tipo_inscripcion}
                disabled={true} // SIEMPRE deshabilitado - el sistema lo calcula
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                aria-describedby="tipo-inscripcion-help"
              >
                <option value={TIPO_INSCRIPCION.MAYOR_EDAD}>Mayor de Edad</option>
                <option value={TIPO_INSCRIPCION.MENOR_EDAD}>Menor de Edad (requiere representante)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                <FiLock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            {/* Indicador visual del tipo con transición */}
            <div 
              id="tipo-inscripcion-help"
              className={`mt-2 flex items-center text-xs rounded-md px-2 py-1.5 transition-all duration-300 ${
                isMinor 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}
            >
              <FiInfo className="w-3 h-3 mr-1.5 flex-shrink-0" />
              <span>
                {!tieneEdadCalculada 
                  ? 'Ingrese la fecha de nacimiento para calcular el tipo'
                  : isMinor 
                    ? `Edad: ${formData.edad} años → MENOR_EDAD (requiere representante legal)`
                    : `Edad: ${formData.edad} años → MAYOR_EDAD (no requiere representante)`
                }
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* SECCIÓN: REPRESENTANTE (solo menores - con animación suave) */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isMinor 
            ? 'max-h-[1000px] opacity-100 transform translate-y-0' 
            : 'max-h-0 opacity-0 transform -translate-y-4'
        }`}
      >
        {isMinor && (
          <Card className="p-4 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FiUsers className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900">Datos del Representante Legal</h3>
              </div>
              <span className="text-xs font-medium text-white bg-purple-600 px-3 py-1 rounded-full animate-pulse">
                ⚠️ Obligatorio
              </span>
            </div>
            
            {/* Mensaje informativo */}
            <div className="mb-4 p-2 bg-purple-100 rounded-md text-sm text-purple-800 flex items-center">
              <FiInfo className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>El representante legal será responsable del atleta menor de edad.</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderInput('nombre_representante', 'Nombre Completo', 'text', true)}
              {renderInput('cedula_representante', 'Cédula', 'text', true)}
              {renderInput('parentesco_representante', 'Parentesco', 'text', true)}
              {renderInput('telefono_representante', 'Teléfono', 'tel', true)}
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
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white py-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading || isSubmitting}>
          <FiX className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading || isSubmitting} loading={loading || isSubmitting}>
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
