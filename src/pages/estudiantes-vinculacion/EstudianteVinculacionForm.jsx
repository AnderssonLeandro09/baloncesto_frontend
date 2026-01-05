import { useEffect } from 'react'
import { FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Modal, Button, Input, Select } from '../../components/common'
import { useEstudianteVinculacionStore } from '../../stores'
import { useForm } from '../../hooks'

const initialValues = {
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

const EstudianteVinculacionForm = ({ isOpen, onClose }) => {
  const { 
    estudianteSeleccionado, 
    createEstudiante, 
    updateEstudiante, 
    loading,
    clearEstudianteSeleccionado
  } = useEstudianteVinculacionStore()

  const isEdit = !!estudianteSeleccionado

  // Validación dinámica según el modo (crear/editar)
  const validate = (values) => {
    const errors = {}
    if (!values.identification) errors.identification = 'La identificación es obligatoria'
    if (!values.first_name) errors.first_name = 'El nombre es obligatorio'
    if (!values.last_name) errors.last_name = 'El apellido es obligatorio'
    
    // Email y password solo son obligatorios en modo creación
    if (!isEdit) {
      if (!values.email) {
        errors.email = 'El email es obligatorio'
      } else if (!values.email.endsWith('@unl.edu.ec')) {
        errors.email = 'El correo debe ser institucional (@unl.edu.ec)'
      }
      if (!values.password) {
        errors.password = 'La contraseña es obligatoria'
      } else if (values.password.length > 30) {
        errors.password = 'La contraseña no puede exceder los 30 caracteres'
      }
    }
    
    if (!values.carrera) errors.carrera = 'La carrera es obligatoria'
    if (!values.semestre) errors.semestre = 'El semestre es obligatorio'
    return errors
  }

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setMultipleValues
  } = useForm(initialValues, validate)

  useEffect(() => {
    if (isOpen) {
      if (estudianteSeleccionado) {
        const { persona, estudiante } = estudianteSeleccionado
        setMultipleValues({
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
        setMultipleValues(initialValues)
      }
    }
  }, [isOpen, estudianteSeleccionado, setMultipleValues])

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
      estudiante: {
        carrera: formValues.carrera,
        semestre: formValues.semestre
      }
    }

    const result = isEdit 
      ? await updateEstudiante(estudianteSeleccionado.estudiante.id, payload)
      : await createEstudiante(payload)

    if (result.success) {
      toast.success(isEdit ? 'Estudiante actualizado exitosamente' : 'Estudiante creado exitosamente')
      onClose()
      if (isEdit) clearEstudianteSeleccionado()
    } else {
      toast.error(result.error || 'Ocurrió un error inesperado')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
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

          {/* Datos de Vinculación */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 border-b pb-1">Datos de Vinculación</h3>
            
            <Input
              label="Carrera"
              name="carrera"
              value={values.carrera}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.carrera}
              touched={touched.carrera}
              required
              placeholder="Ej. Ingeniería en Sistemas"
            />

            <Input
              label="Semestre"
              name="semestre"
              value={values.semestre}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.semestre}
              touched={touched.semestre}
              required
              placeholder="Ej. Séptimo"
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

export default EstudianteVinculacionForm
