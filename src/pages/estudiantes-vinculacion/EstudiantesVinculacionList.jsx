import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Card, Button, ConfirmDialog } from '../../components/common'
import { UsuariosTable, UsuarioDetalleModal } from '../../components/usuarios'
import { useEstudianteVinculacionStore } from '../../stores'
import { useModal } from '../../hooks'
import EstudianteVinculacionForm from './EstudianteVinculacionForm'
import { getEstudianteFriendlyMessage } from '../../utils/estudianteVinculacionValidators'

const EstudiantesVinculacionList = () => {
  const { 
    estudiantes, 
    loading,
    fieldErrors,
    fetchEstudiantes, 
    deleteEstudiante,
    setEstudianteSeleccionado,
    clearErrors
  } = useEstudianteVinculacionStore()
  
  const deleteModal = useModal()
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

  const handleDeleteClick = (estudiante) => {
    setEstudianteSeleccionado(estudiante)
    deleteModal.open()
  }

  const handleConfirmDelete = async () => {
    const { estudianteSeleccionado } = useEstudianteVinculacionStore.getState()
    if (estudianteSeleccionado) {
      const result = await deleteEstudiante(estudianteSeleccionado.estudiante.id)
      if (result.success) {
        toast.success(result.message || 'Estudiante dado de baja exitosamente')
        deleteModal.close()
      } else {
        const friendlyMessage = getEstudianteFriendlyMessage(result.error)
        toast.error(friendlyMessage || 'No se pudo dar de baja al estudiante')
      }
    }
  }

  const handleFormClose = () => {
    clearErrors()
    setServerErrors({})
    formModal.close()
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
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => (
        <div className="flex space-x-2">
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
          <button 
            onClick={() => handleDeleteClick(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Dar de baja"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
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

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title="Dar de baja estudiante"
        message="¿Está seguro que desea dar de baja a este estudiante? Esta acción no se puede deshacer."
        variant="danger"
        isLoading={loading}
      />
    </div>
  )
}

export default EstudiantesVinculacionList
