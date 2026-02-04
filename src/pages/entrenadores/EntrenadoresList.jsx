import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Card, Button, ConfirmDialog } from '../../components/common'
import { UsuariosTable, UsuarioDetalleModal } from '../../components/usuarios'
import { useEntrenadorStore } from '../../stores'
import { useModal } from '../../hooks'
import EntrenadorForm from './EntrenadorForm'

const EntrenadoresList = () => {
  const { 
    entrenadores, 
    loading, 
    fetchEntrenadores, 
    deleteEntrenador,
    setEntrenadorSeleccionado,
    entrenadorSeleccionado
  } = useEntrenadorStore()
  
  const deleteModal = useModal()
  const detalleModal = useModal()
  const formModal = useModal()
  const [entrenadorDetalle, setEntrenadorDetalle] = useState(null)

  useEffect(() => {
    fetchEntrenadores()
  }, [fetchEntrenadores])

  const handleNew = () => {
    setEntrenadorSeleccionado(null)
    formModal.open()
  }

  const handleEdit = (entrenador) => {
    setEntrenadorSeleccionado(entrenador)
    formModal.open()
  }

  const handleViewDetails = (entrenador) => {
    setEntrenadorDetalle(entrenador)
    detalleModal.open()
  }

  const handleDeleteClick = (entrenador) => {
    setEntrenadorSeleccionado(entrenador)
    deleteModal.open()
  }

  const handleConfirmDelete = async () => {
    const { entrenadorSeleccionado } = useEntrenadorStore.getState()
    if (entrenadorSeleccionado) {
      const result = await deleteEntrenador(entrenadorSeleccionado.entrenador.id)
      if (result.success) {
        const wasInactive = result.data?.entrenador?.eliminado
        toast.success(wasInactive ? 'Entrenador desactivado exitosamente' : 'Entrenador activado exitosamente')
        deleteModal.close()
      } else {
        toast.error(result.error || 'Error al actualizar el estado del entrenador')
      }
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
        const first = p.first_name || p.firts_name || '';
        const last = p.last_name || '';
        return `${first} ${last}`.trim() || 'N/A';
      }
    },
    { 
      key: 'especialidad', 
      title: 'Especialidad',
      render: (_, row) => row.entrenador?.especialidad || 'N/A'
    },
    { 
      key: 'club_asignado', 
      title: 'Club',
      render: (_, row) => row.entrenador?.club_asignado || 'N/A'
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (_, row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.entrenador?.eliminado ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {row.entrenador?.eliminado ? 'Desactivado' : 'Activo'}
        </span>
      )
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
            className={`p-1 rounded ${row.entrenador?.eliminado ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
            title={row.entrenador?.eliminado ? 'Activar' : 'Desactivar'}
          >
            {row.entrenador?.eliminado ? (
              <FiToggleLeft className="w-4 h-4" />
            ) : (
              <FiToggleRight className="w-4 h-4" />
            )}
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
          <h1 className="text-2xl font-bold text-gray-900">Entrenadores</h1>
          <p className="text-gray-500">Gestión de entrenadores del sistema</p>
        </div>
        <Button onClick={handleNew}>
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Entrenador
        </Button>
      </div>

      <Card>
        <UsuariosTable
          columns={columns}
          data={entrenadores}
          loading={loading}
          emptyMessage="No hay entrenadores registrados"
          searchPlaceholder="Buscar por nombre o identificación..."
          searchFields={searchFields}
        />
      </Card>

      <EntrenadorForm 
        isOpen={formModal.isOpen} 
        onClose={formModal.close} 
      />

      <UsuarioDetalleModal
        isOpen={detalleModal.isOpen}
        onClose={detalleModal.close}
        usuario={entrenadorDetalle}
        tipo="entrenador"
      />

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title={entrenadorSeleccionado?.entrenador?.eliminado ? 'Activar entrenador' : 'Desactivar entrenador'}
        message={entrenadorSeleccionado?.entrenador?.eliminado
          ? '¿Está seguro que desea activar a este entrenador?'
          : '¿Está seguro que desea desactivar a este entrenador? Podrá reactivarlo más adelante.'}
        variant="danger"
        isLoading={loading}
      />
    </div>
  )
}

export default EntrenadoresList
