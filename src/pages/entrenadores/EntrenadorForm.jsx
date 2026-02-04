import { useEffect, useState } from 'react'
import { FiSave, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Modal, Button, Input, Select } from '../../components/common'
import { useEntrenadorStore } from '../../stores'
import { useForm } from '../../hooks'
import { validarEspecialidad, validarClubAsignado, VALIDACIONES_ENTRENADOR, TOOLTIPS_ENTRENADOR } from '../../utils/validacionesEntrenador'
import { isValidCedula, isValidEmail, isValidPhone } from '../../utils/validators'

// Función inteligente para capitalizar nombres (solo primeras letras)
const capitalizeWords = (str) => {
  if (!str) return ''
  return str
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Función para convertir texto general a mayúsculas (nombres de especialidad, etc)
const toUpperCase = (str) => {
  if (!str) return ''
  return str.trim().toUpperCase()
}

const initialValues = {
  identification: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phono: '',
  direction: '',
  especialidad: '',
  club_asignado: ''
}

const EntrenadorForm = ({ isOpen, onClose }) => {
  const { 
    entrenadorSeleccionado, 
    createEntrenador, 
    updateEntrenador, 
    loading,
    clearEntrenadorSeleccionado
  } = useEntrenadorStore()

  const isEdit = !!entrenadorSeleccionado
  
  // Estados para manejo de errores
  const [duplicateCedulaError, setDuplicateCedulaError] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  // Validación dinámica según el modo (crear/editar)
  const validate = (values) => {
    const errors = {}
    if (!values.identification) {
      errors.identification = 'La identificación es obligatoria'
    } else if (!/^\d+$/.test(values.identification)) {
      errors.identification = 'La identificación debe contener solo números'
    } else if (!isValidCedula(values.identification)) {
      errors.identification = 'La cédula ecuatoriana no es válida'
    }

    if (!values.first_name) {
      errors.first_name = 'El nombre es obligatorio'
    } else {
      const nombre = values.first_name.trim()
      if (nombre.length < 3) errors.first_name = 'El nombre debe tener al menos 3 caracteres'
      if (nombre.length > 20) errors.first_name = 'El nombre no puede exceder 20 caracteres'
    }

    if (!values.last_name) {
      errors.last_name = 'El apellido es obligatorio'
    } else {
      const apellido = values.last_name.trim()
      if (apellido.length < 3) errors.last_name = 'El apellido debe tener al menos 3 caracteres'
      if (apellido.length > 20) errors.last_name = 'El apellido no puede exceder 20 caracteres'
    }
    
    // Email y password solo son obligatorios en modo creación
    if (!isEdit) {
      if (!values.email) errors.email = 'El email es obligatorio'
      else if (!isValidEmail(values.email) || !/^[^\s@]+@(gmail\.com|unl\.edu\.ec)$/i.test(values.email)) {
        errors.email = 'El email debe ser un Gmail válido o un correo institucional UNL (@unl.edu.ec)'
      }
      if (!values.password) {
        errors.password = 'La contraseña es obligatoria'
      } else if (values.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres'
      } else if (!/(?=.*[A-Z])/.test(values.password)) {
        errors.password = 'La contraseña debe contener al menos una mayúscula'
      } else if (!/(?=.*[0-9])/.test(values.password)) {
        errors.password = 'La contraseña debe contener al menos un número'
      } else if (values.password.length > 30) {
        errors.password = 'La contraseña no puede exceder los 30 caracteres'
      }
    }

    if (values.phono) {
      if (!/^\d+$/.test(values.phono)) {
        errors.phono = 'El teléfono debe contener solo números'
      } else if (!isValidPhone(values.phono)) {
        errors.phono = 'El teléfono no es válido'
      }
    }

    if (!values.direction) {
      errors.direction = 'La dirección es obligatoria'
    } else {
      const direccion = values.direction.trim()
      if (direccion.length < 3) errors.direction = 'La dirección debe tener al menos 3 caracteres'
      if (direccion.length > 20) errors.direction = 'La dirección no puede exceder 20 caracteres'
    }
    
    // Validar especialidad y club_asignado con utilidades específicas
    const errorEspecialidad = validarEspecialidad(values.especialidad)
    if (errorEspecialidad) errors.especialidad = errorEspecialidad
    
    const errorClubAsignado = validarClubAsignado(values.club_asignado)
    if (errorClubAsignado) errors.club_asignado = errorClubAsignado
    
    return errors
  }

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setMultipleValues,
    reset
  } = useForm(initialValues, validate)

  // Manejador personalizado para limpiar error de cédula cuando se modifica
  const handleIdentificationChange = (e) => {
    handleChange(e)
    setDuplicateCedulaError(null)
  }

  useEffect(() => {
    if (isOpen) {
      // Limpiar errores al abrir el modal
      setDuplicateCedulaError(null)
      setSubmitError(null)
      
      if (entrenadorSeleccionado) {
        console.log('=== CARGANDO DATOS PARA EDICIÓN ===')
        console.log('entrenadorSeleccionado completo:', entrenadorSeleccionado)
        console.log('persona:', entrenadorSeleccionado.persona)
        console.log('entrenador:', entrenadorSeleccionado.entrenador)
        
        const { persona, entrenador } = entrenadorSeleccionado
        setMultipleValues({
          id: entrenador.id,
          identification: persona?.identification || '',
          first_name: persona?.first_name || persona?.firts_name || '',
          last_name: persona?.last_name || '',
          email: '', // No mostrar email en edición
          password: '', // No mostrar password en edición
          phono: persona?.phono || '',
          direction: persona?.direction || '',
          especialidad: entrenador.especialidad || '',
          club_asignado: entrenador.club_asignado || ''
        })
        
        console.log('Valores cargados:', {
          identification: persona?.identification,
          first_name: persona?.first_name,
          last_name: persona?.last_name,
          especialidad: entrenador.especialidad,
          club_asignado: entrenador.club_asignado
        })
      } else {
        setMultipleValues(initialValues)
      }
    }
  }, [isOpen, entrenadorSeleccionado, setMultipleValues])

  const onSubmit = async (formValues) => {
    // Limpiar errores previos
    setDuplicateCedulaError(null)
    setSubmitError(null)
    
    // Debug: mostrar valores antes de enviar
    console.log('Valores antes de procesar:', formValues)
    
    const personaData = {
      first_name: capitalizeWords(formValues.first_name),
      last_name: capitalizeWords(formValues.last_name),
      phono: formValues.phono ? formValues.phono.trim() : null, // null si está vacío, no string vacío
      direction: capitalizeWords(formValues.direction),
      type_identification: 'CEDULA',
      type_stament: 'ESTUDIANTES'
    }

    // Incluir identification siempre (necesario para el backend)
    personaData.identification = formValues.identification.trim()

    // Solo incluir email y password en modo creación
    if (!isEdit) {
      personaData.email = formValues.email.trim() // NO cambiar a minúsculas
      personaData.password = formValues.password // NO cambiar contraseña
    }

    const payload = {
      persona: personaData,
      entrenador: {
        especialidad: toUpperCase(formValues.especialidad),
        club_asignado: toUpperCase(formValues.club_asignado)
      }
    }
    
    // Debug: mostrar payload completo
    console.log('Payload a enviar:', JSON.stringify(payload, null, 2))
    console.log('Identificación:', personaData.identification)
    console.log('Email:', personaData.email)
    console.log('Nombre:', personaData.first_name)
    console.log('Apellido:', personaData.last_name)

    try {
      const result = isEdit 
        ? await updateEntrenador(entrenadorSeleccionado.entrenador.id, payload)
        : await createEntrenador(payload)

      if (result.success) {
        toast.success(isEdit ? 'Entrenador actualizado exitosamente' : 'Entrenador creado exitosamente')
        onClose()
        if (isEdit) clearEntrenadorSeleccionado()
      } else {
        // Procesar errores del backend
        const errorMsg = result.error || 'Ocurrió un error inesperado'
        
        // Debug: mostrar error completo en consola
        console.error('Error completo del backend:', errorMsg)
        console.error('Tipo de error:', typeof errorMsg)
        console.error('Es array:', Array.isArray(errorMsg))
        
        // Si es array de errores, tomar el primero
        let displayError = Array.isArray(errorMsg) ? errorMsg[0] : errorMsg
        
        // Debug: mostrar el error procesado
        console.error('Error procesado:', displayError)
        
        // Buscar errores específicos de validación
        if (typeof displayError === 'string') {
          if (displayError.includes('Error en módulo de usuarios')) {
            // Intentar extraer mensaje más específico
            const match = displayError.match(/Error en módulo de usuarios:\s*(.+?)$/i)
            if (match && match[1]) {
              displayError = match[1]
            } else {
              displayError = 'Error de validación en el módulo de usuarios. Verifica que los datos sean correctos.'
            }
          }
        }
        
        // Detectar error de cédula duplicada y personalizar mensaje
        const isDuplicateError = 
          displayError.toLowerCase().includes('ya existe') ||
          displayError.toLowerCase().includes('ya se encuentra registrado') ||
          displayError.toLowerCase().includes('identification') ||
          displayError.toLowerCase().includes('duplicado')
        
        if (isDuplicateError) {
          setDuplicateCedulaError('La cedula actual ya se encuentra registrada')
          toast.error('La cedula actual ya se encuentra registrada')
        } else {
          setSubmitError(displayError)
          toast.error(displayError)
          // Instrucción en consola detallada
          console.log('='.repeat(80))
          console.log('❌ ERROR AL CREAR ENTRENADOR')
          console.log('='.repeat(80))
          console.log('INFORMACIÓN DE DEPURACIÓN:')
          console.log('Cédula:', payload.persona.identification)
          console.log('Nombre:', payload.persona.first_name)
          console.log('Apellido:', payload.persona.last_name)
          console.log('Email:', payload.persona.email)
          console.log('Teléfono:', payload.persona.phono)
          console.log('Error del backend:', displayError)
          console.log('Payload completo:', payload)
          console.log('='.repeat(80))
        }
      }
    } catch (error) {
      const errorMsg = error?.message || 'Ocurrió un error inesperado'
      console.error('Exception no controlada:', error)
      setSubmitError(errorMsg)
      toast.error(errorMsg)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Entrenador' : 'Nuevo Entrenador'}
      size="lg"
    >
      {/* Error de cédula duplicada */}
      {duplicateCedulaError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="w-full">
            <h4 className="text-sm font-bold text-red-800 mb-1">Cédula ya registrada</h4>
            <p className="text-sm text-red-700">{duplicateCedulaError}</p>
            <p className="text-xs text-red-500 mt-1">Corrija el número de cédula para continuar.</p>
          </div>
        </div>
      )}

      {/* Error general (otros errores) */}
      {submitError && !duplicateCedulaError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 mb-4">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="overflow-hidden break-words w-full">
            <h4 className="text-sm font-medium text-red-800">Error al guardar</h4>
            <p className="text-sm text-red-700 break-words">{submitError}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Datos Personales */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 border-b pb-1">Datos Personales</h3>
            
            <Input
              label="Identificación (Cédula)"
              name="identification"
              value={values.identification}
              onChange={handleIdentificationChange}
              onBlur={handleBlur}
              error={errors.identification || duplicateCedulaError}
              touched={touched.identification}
              required
              inputMode="numeric"
              pattern="\d*"
              maxLength={10}
              disabled={isEdit}
              helperText={isEdit ? 'El DNI no puede ser modificado' : ''}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombres"
                name="first_name"
                value={values.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.first_name}
                touched={touched.first_name}
                required
                minLength={3}
                maxLength={20}
              />
              <Input
                label="Apellidos"
                name="last_name"
                value={values.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.last_name}
                touched={touched.last_name}
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            {!isEdit && (
              <>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                  required
                />

                <Input
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  touched={touched.password}
                  required
                />
              </>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Input
                label="Teléfono"
                name="phono"
                value={values.phono}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phono}
                touched={touched.phono}
                inputMode="numeric"
                pattern="\d*"
              />
            </div>

            <Input
              label="Dirección"
              name="direction"
              value={values.direction}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.direction}
              touched={touched.direction}
              minLength={3}
              maxLength={20}
            />
          </div>

          {/* Datos de Entrenador */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 border-b pb-1">Datos de Entrenador</h3>
            
            <Input
              label="Especialidad"
              name="especialidad"
              value={values.especialidad}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.especialidad}
              touched={touched.especialidad}
              required
              placeholder="Ej. Táctica, Preparación Física"
              minLength={VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MIN_LENGTH}
              maxLength={VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MAX_LENGTH}
              title={TOOLTIPS_ENTRENADOR.ESPECIALIDAD}
              helperText={`Mín: ${VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MIN_LENGTH} | Máx: ${VALIDACIONES_ENTRENADOR.ESPECIALIDAD.MAX_LENGTH} caracteres`}
            />

            <Input
              label="Club Asignado"
              name="club_asignado"
              value={values.club_asignado}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.club_asignado}
              touched={touched.club_asignado}
              required
              placeholder="Ej. Club UNL"
              minLength={VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MIN_LENGTH}
              maxLength={VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MAX_LENGTH}
              title={TOOLTIPS_ENTRENADOR.CLUB_ASIGNADO}
              helperText={`Mín: ${VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MIN_LENGTH} | Máx: ${VALIDACIONES_ENTRENADOR.CLUB_ASIGNADO.MAX_LENGTH} caracteres`}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            isLoading={loading}
          >
            <FiSave className="w-4 h-4 mr-2" />
            {isEdit ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EntrenadorForm
