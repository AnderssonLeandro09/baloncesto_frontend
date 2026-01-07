import { useEffect } from 'react'
import { FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Modal, Button, Input, Select } from '../../components/common'
import { useEntrenadorStore } from '../../stores'
import { useForm } from '../../hooks'
import { validarDatosEntrenador, validarEspecialidad, validarClubAsignado, MENSAJES_ERROR_ENTRENADOR, VALIDACIONES_ENTRENADOR, TOOLTIPS_ENTRENADOR } from '../../utils/validacionesEntrenador'

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

  // Validación dinámica según el modo (crear/editar)
  const validate = (values) => {
    const errors = {}
    if (!values.identification) errors.identification = 'La identificación es obligatoria'
    if (!values.first_name) errors.first_name = 'El nombre es obligatorio'
    if (!values.last_name) errors.last_name = 'El apellido es obligatorio'
    
    // Email y password solo son obligatorios en modo creación
    if (!isEdit) {
      if (!values.email) errors.email = 'El email es obligatorio'
      if (!values.password) {
        errors.password = 'La contraseña es obligatoria'
      } else if (values.password.length > 30) {
        errors.password = 'La contraseña no puede exceder los 30 caracteres'
      }
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

  useEffect(() => {
    if (isOpen) {
      if (entrenadorSeleccionado) {
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
      } else {
        setMultipleValues(initialValues)
      }
    }
  }, [isOpen, entrenadorSeleccionado, setMultipleValues])

  const onSubmit = async (formValues) => {
    const personaData = {
      identification: formValues.identification,
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      phono: formValues.phono,
      direction: formValues.direction,
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
      entrenador: {
        especialidad: formValues.especialidad,
        club_asignado: formValues.club_asignado
      }
    }

    const result = isEdit 
      ? await updateEntrenador(entrenadorSeleccionado.entrenador.id, payload)
      : await createEntrenador(payload)

    if (result.success) {
      toast.success(isEdit ? 'Entrenador actualizado exitosamente' : 'Entrenador creado exitosamente')
      onClose()
      if (isEdit) clearEntrenadorSeleccionado()
    } else {
      toast.error(result.error || 'Ocurrió un error inesperado')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Entrenador' : 'Nuevo Entrenador'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Datos Personales */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 border-b pb-1">Datos Personales</h3>
            
            <Input
              label="Identificación (Cédula)"
              name="identification"
              value={values.identification}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.identification}
              touched={touched.identification}
              required
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
              />
            </div>

            <Input
              label="Dirección"
              name="direction"
              value={values.direction}
              onChange={handleChange}
              onBlur={handleBlur}
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
