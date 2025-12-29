import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Card, Button, Table, ConfirmDialog } from '../../components/common'
import { useEntrenadorStore } from '../../stores'
import { useModal } from '../../hooks'

const EntrenadoresList = () => {
  const navigate = useNavigate()
  const { 
    entrenadores, 
    loading, 
    fetchEntrenadores, 
    deleteEntrenador,
    setEntrenadorSeleccionado 
  } = useEntrenadorStore()
  
  const deleteModal = useModal()

  useEffect(() => {
    fetchEntrenadores()
  }, [fetchEntrenadores])

  const handleEdit = (entrenador) => {
    setEntrenadorSeleccionado(entrenador)
    navigate(`${entrenador.entrenador.id}/editar`)
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
        deleteModal.close()
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
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => (
        <div className="flex space-x-2">
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrenadores</h1>
          <p className="text-gray-500">Gestión de entrenadores del sistema</p>
        </div>
        <Button onClick={() => navigate('nuevo')}>
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Entrenador
        </Button>
      </div>

      <Card padding={false}>
        <Table
          columns={columns}
          data={entrenadores}
          loading={loading}
          emptyMessage="No hay entrenadores registrados"
        />
      </Card>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title="Dar de baja entrenador"
        message="¿Está seguro que desea dar de baja a este entrenador? Esta acción no se puede deshacer."
        variant="danger"
        isLoading={loading}
      />
    </div>
  )
}

export default EntrenadoresList
