import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiSave, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Modal, Button } from '../../components/common'
import { InputUsuario } from '../../components/usuarios'
import { useEstudianteVinculacionStore } from '../../stores'
import {
  ESTUDIANTE_VINCULACION_CONSTRAINTS,
  validateIdentification,
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validatePhono,
  validateCarrera,
  validateSemestre,
  getEstudianteFriendlyMessage
} from '../../utils/estudianteVinculacionValidators'

const defaultValues = {
  identification: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phono: '',
  direction: '',
  carrera: '',
  semestre: ''
}

const EstudianteVinculacionForm = ({ isOpen, onClose, serverErrors = {} }) => {
  const { 
    estudianteSeleccionado, 
    createEstudiante, 
    updateEstudiante, 
    loading,
    clearEstudianteSeleccionado,
    clearErrors
  } = useEstudianteVinculacionStore()

  const isEdit = !!estudianteSeleccionado
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors: clearFormErrors,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false)
      clearErrors()
      clearFormErrors()
      
      if (estudianteSeleccionado) {
        const { persona, estudiante } = estudianteSeleccionado
        reset({
          id: estudiante.id,
          identification: persona.identification || '',
          first_name: persona.firts_name || persona.first_name || persona.nombres || persona.firstName || '',
          last_name: persona.last_name || persona.apellidos || persona.lastName || '',
          email: '', // No mostrar email en edición
          password: '', // No mostrar password en edición
          phono: persona.phono || persona.phone || '',
          direction: persona.direction || persona.address || '',
          carrera: estudiante.carrera || '',
          semestre: estudiante.semestre || ''
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [isOpen, estudianteSeleccionado, reset, clearErrors, clearFormErrors])

  // Aplicar errores del servidor a los campos del formulario
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      Object.entries(serverErrors).forEach(([field, message]) => {
        setError(field, { type: 'server', message })
      })
    }
  }, [serverErrors, setError])

  // Validaciones de campos que replican las del backend
  const fieldValidations = {
    identification: {
      validate: (value) => {
        const result = validateIdentification(value)
        return result.valid || result.message
      }
    },
    first_name: {
      validate: (value) => {
        const result = validateFirstName(value)
        return result.valid || result.message
      }
    },
    last_name: {
      validate: (value) => {
        const result = validateLastName(value)
        return result.valid || result.message
      }
    },
    email: {
      validate: (value) => {
        if (isEdit) return true // Opcional en edición
        const result = validateEmail(value, !isEdit)
        return result.valid || result.message
      }
    },
    password: {
      validate: (value) => {
        if (isEdit) return true // Opcional en edición
        const result = validatePassword(value, !isEdit)
        return result.valid || result.message
      }
    },
    phono: {
      validate: (value) => {
        const result = validatePhono(value)
        return result.valid || result.message
      }
    },
    carrera: {
      validate: (value) => {
        const result = validateCarrera(value)
        return result.valid || result.message
      }
    },
    semestre: {
      validate: (value) => {
        const result = validateSemestre(value)
        return result.valid || result.message
      }
    }
  }

  const onSubmit = async (formValues) => {
    setIsSubmitted(true)
    clearErrors()

    const personaData = {
      identification: formValues.identification,
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      phono: formValues.phono || '',
      direction: formValues.direction || '',
      type_identification: 'CEDULA',
      type_stament: 'ESTUDIANTES'
    }

    // Solo incluir email y password en modo creación
    if (!isEdit) {
      personaData.email = formValues.email
      personaData.password = formValues.password
    }

    const payload = {
      persona: personaData,
      estudiante: {
        carrera: formValues.carrera,
        semestre: formValues.semestre.toUpperCase()
      }
    }

    const result = isEdit 
      ? await updateEstudiante(estudianteSeleccionado.estudiante.id, payload)
      : await createEstudiante(payload)

    if (result.success) {
      toast.success(result.message || (isEdit ? 'Estudiante actualizado exitosamente' : 'Estudiante creado exitosamente'))
      onClose()
      if (isEdit) clearEstudianteSeleccionado()
    } else {
      // Aplicar errores del servidor a los campos del formulario
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message })
        })
      }
      toast.error(getEstudianteFriendlyMessage(result.error) || 'Ocurrió un error inesperado')
    }
  }

  // Función para obtener el error de un campo (del formulario o del servidor)
  const getFieldError = (fieldName) => {
    return errors[fieldName]?.message || serverErrors[fieldName]
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Mostrar errores generales del servidor */}
        {Object.keys(serverErrors).length > 0 && isSubmitted && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              Por favor, corrige los errores marcados en el formulario.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Datos Personales */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 border-b pb-1">Datos Personales</h3>
            
            <InputUsuario
              label="Identificación"
              {...register('identification', fieldValidations.identification)}
              error={getFieldError('identification')}
              required
              maxLength={ESTUDIANTE_VINCULACION_CONSTRAINTS.identification.maxLength}
              placeholder="Ingresa el número de identificación"
              disabled={isEdit}
            />

            <div className="grid grid-cols-2 gap-3">
              <InputUsuario
                label="Nombres"
                {...register('first_name', fieldValidations.first_name)}
                error={getFieldError('first_name')}
                required
                maxLength={ESTUDIANTE_VINCULACION_CONSTRAINTS.first_name.maxLength}
              />
              <InputUsuario
                label="Apellidos"
                {...register('last_name', fieldValidations.last_name)}
                error={getFieldError('last_name')}
                required
                maxLength={ESTUDIANTE_VINCULACION_CONSTRAINTS.last_name.maxLength}
              />
            </div>

            {!isEdit && (
              <>
                <InputUsuario
                  label="Email Institucional"
                  type="email"
                  {...register('email', fieldValidations.email)}
                  error={getFieldError('email')}
                  required
                  placeholder="ejemplo@unl.edu.ec"
                />

                <InputUsuario
                  label="Contraseña"
                  type="password"
                  {...register('password', fieldValidations.password)}
                  error={getFieldError('password')}
                  required
                  minLength={ESTUDIANTE_VINCULACION_CONSTRAINTS.password.minLength}
                  maxLength={ESTUDIANTE_VINCULACION_CONSTRAINTS.password.maxLength}
                  placeholder="Mínimo 8 caracteres, una mayúscula y un número"
                />
              </>
            )}

            <div className="grid grid-cols-1 gap-3">
              <InputUsuario
                label="Teléfono"
                {...register('phono', fieldValidations.phono)}
                error={getFieldError('phono')}
                placeholder="Ej. 0991234567"
              />
            </div>

            <InputUsuario
              label="Dirección"
              {...register('direction')}
              placeholder="Dirección del estudiante (opcional)"
            />
          </div>

          {/* Datos de Vinculación */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 border-b pb-1">Datos de Vinculación</h3>
            
            <InputUsuario
              label="Carrera"
              {...register('carrera', fieldValidations.carrera)}
              error={getFieldError('carrera')}
              required
              minLength={ESTUDIANTE_VINCULACION_CONSTRAINTS.carrera.minLength}
              maxLength={ESTUDIANTE_VINCULACION_CONSTRAINTS.carrera.maxLength}
              placeholder="Ej. Ingeniería en Sistemas"
            />

            <InputUsuario
              label="Semestre"
              {...register('semestre', fieldValidations.semestre)}
              error={getFieldError('semestre')}
              required
              placeholder="1-10 o A-J"
            />
            
            {/* Hint para semestre */}
            <p className="text-xs text-gray-500 -mt-2">
              Ingresa un número del 1 al 10, o una letra de la A a la J
            </p>
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

export default EstudianteVinculacionForm
