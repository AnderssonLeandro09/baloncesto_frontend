import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Card, Button } from '../../components/common'
import { UsuariosTable, UsuarioDetalleModal } from '../../components/usuarios'
import { useEstudianteVinculacionStore } from '../../stores'
import { useModal } from '../../hooks'
import EstudianteVinculacionForm from './EstudianteVinculacionForm'

const EstudiantesVinculacionList = () => {
  const { 
    estudiantes, 
    loading,
    fieldErrors,
    fetchEstudiantes, 
    toggleEstado,
    setEstudianteSeleccionado,
    clearErrors
  } = useEstudianteVinculacionStore()
  
  const detalleModal = useModal()
  const formModal = useModal()
  const [estudianteDetalle, setEstudianteDetalle] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  useEffect(() => {
    fetchEstudiantes()
  }, [fetchEstudiantes])

  // Sincronizar errores del store con el estado local
  useEffect(() => {
    setServerErrors(fieldErrors || {})
  }, [fieldErrors])

  const handleNew = () => {
    setEstudianteSeleccionado(null)
    clearErrors()
    setServerErrors({})
    formModal.open()
  }

  const handleEdit = (estudiante) => {
    setEstudianteSeleccionado(estudiante)
    clearErrors()
    setServerErrors({})
    formModal.open()
  }

  const handleViewDetails = (estudiante) => {
    setEstudianteDetalle(estudiante)
    detalleModal.open()
  }

  const handleFormClose = () => {
    clearErrors()
    setServerErrors({})
    formModal.close()
  }

  const handleToggleStatus = async (estudiante) => {
    const result = await toggleEstado(estudiante.estudiante.id)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
  }

  const columns = [
    { 
      key: 'identification', 
      title: 'Identificación',
      render: (_, row) => row.persona?.identification || 'N/A'
    },
    { 
      key: 'nombre', 
      title: 'Nombre Completo',
      render: (_, row) => {
        const p = row.persona;
        if (!p) return 'N/A';
        const first = p.firts_name || p.first_name || p.nombres || p.firstName || '';
        const last = p.last_name || p.apellidos || p.lastName || '';
        return `${first} ${last}`.trim() || 'N/A';
      }
    },
    { 
      key: 'carrera', 
      title: 'Carrera',
      render: (_, row) => row.estudiante?.carrera || 'N/A'
    },
    { 
      key: 'semestre', 
      title: 'Semestre',
      render: (_, row) => row.estudiante?.semestre || 'N/A'
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (_, row) => {
        const habilitado = !row.estudiante?.eliminado
        return (
          <div className="flex items-center">
            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
              habilitado ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${
              habilitado ? 'text-green-700' : 'text-red-700'
            }`}>
              {habilitado ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
        )
      }
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => {
        const habilitado = !row.estudiante?.eliminado
        return (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleViewDetails(row)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Ver detalles"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleEdit(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Editar"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            {/* Toggle Estado */}
            <button
              onClick={() => handleToggleStatus(row)}
              title={habilitado ? 'Deshabilitar estudiante' : 'Habilitar estudiante'}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                habilitado 
                  ? 'bg-green-500 focus:ring-green-500' 
                  : 'bg-gray-300 focus:ring-gray-400'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full shadow-md ${
                  habilitado ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )
      },
    },
  ]

  // Campos para búsqueda (solo nombre e identificación)
  const searchFields = [
    'persona.identification',
    'persona.first_name',
    'persona.firts_name',
    'persona.last_name'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estudiantes de Vinculación</h1>
          <p className="text-gray-500">Gestión de estudiantes en programa de vinculación</p>
        </div>
        <Button onClick={handleNew}>
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Estudiante
        </Button>
      </div>

      <Card>
        <UsuariosTable
          columns={columns}
          data={estudiantes}
          loading={loading}
          emptyMessage="No hay estudiantes de vinculación registrados"
          searchPlaceholder="Buscar por nombre o identificación..."
          searchFields={searchFields}
        />
      </Card>

      <EstudianteVinculacionForm 
        isOpen={formModal.isOpen} 
        onClose={handleFormClose}
        serverErrors={serverErrors}
      />

      <UsuarioDetalleModal
        isOpen={detalleModal.isOpen}
        onClose={detalleModal.close}
        usuario={estudianteDetalle}
        tipo="estudiante"
      />
    </div>
  )
}

export default EstudiantesVinculacionList
