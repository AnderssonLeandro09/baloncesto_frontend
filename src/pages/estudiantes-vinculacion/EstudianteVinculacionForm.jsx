import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { Card, Button, Input, Select } from '../../components/common'
import { useEstudianteVinculacionStore } from '../../stores'
import { useForm } from '../../hooks'

const initialValues = {
  identification: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phono: '',
  gender: 'M',
  direction: '',
  carrera: '',
  semestre: ''
}

const validate = (values) => {
  const errors = {}
  if (!values.identification) errors.identification = 'La identificación es obligatoria'
  if (!values.first_name) errors.first_name = 'El nombre es obligatorio'
  if (!values.last_name) errors.last_name = 'El apellido es obligatorio'
  if (!values.email) {
    errors.email = 'El email es obligatorio'
  } else if (!values.email.endsWith('@unl.edu.ec')) {
    errors.email = 'El correo debe ser institucional (@unl.edu.ec)'
  }
  if (!values.password && !values.id) errors.password = 'La contraseña es obligatoria'
  if (!values.carrera) errors.carrera = 'La carrera es obligatoria'
  if (!values.semestre) errors.semestre = 'El semestre es obligatorio'
  return errors
}

const EstudianteVinculacionForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  
  const { 
    estudianteSeleccionado, 
    createEstudiante, 
    updateEstudiante, 
    loading,
    clearEstudianteSeleccionado
  } = useEstudianteVinculacionStore()

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
    if (isEdit && estudianteSeleccionado) {
      const { persona, estudiante } = estudianteSeleccionado
      setMultipleValues({
        id: estudiante.id,
        identification: persona.identification || '',
        first_name: persona.firts_name || persona.first_name || persona.nombres || persona.firstName || '',
        last_name: persona.last_name || persona.apellidos || persona.lastName || '',
        email: persona.email || '',
        password: '', // No mostramos la contraseña
        phono: persona.phono || persona.phone || '',
        gender: persona.gender || 'M',
        direction: persona.direction || persona.address || '',
        carrera: estudiante.carrera || '',
        semestre: estudiante.semestre || ''
      })
    }
    
    return () => {
      if (isEdit) clearEstudianteSeleccionado()
    }
  }, [isEdit, estudianteSeleccionado, setMultipleValues, clearEstudianteSeleccionado])

  const onSubmit = async (formValues) => {
    const payload = {
      persona: {
        identification: formValues.identification,
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        email: formValues.email,
        password: formValues.password || '12345678', // Password por defecto si es edit y está vacío
        phono: formValues.phono,
        gender: formValues.gender,
        direction: formValues.direction,
        type_identification: 'CEDULA',
        type_stament: 'ESTUDIANTES'
      },
      estudiante: {
        carrera: formValues.carrera,
        semestre: formValues.semestre
      }
    }

    let result
    if (isEdit) {
      result = await updateEstudiante(id, payload)
    } else {
      result = await createEstudiante(payload)
    }

    if (result.success) {
      navigate('/dashboard/estudiantes-vinculacion')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard/estudiantes-vinculacion')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </h1>
            <p className="text-gray-500">
              {isEdit ? 'Actualice la información del estudiante' : 'Complete los datos para registrar un nuevo estudiante'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos Personales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Datos Personales</h3>
              
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  name="phono"
                  value={values.phono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Select
                  label="Género"
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' },
                    { value: 'O', label: 'Otro' }
                  ]}
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Datos de Vinculación</h3>
              
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

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/estudiantes-vinculacion')}
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
      </Card>
    </div>
  )
}

export default EstudianteVinculacionForm
