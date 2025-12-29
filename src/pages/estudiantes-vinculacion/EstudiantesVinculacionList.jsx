import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Card, Button, Table, ConfirmDialog } from '../../components/common'
import { useEstudianteVinculacionStore } from '../../stores'
import { useModal } from '../../hooks'

const EstudiantesVinculacionList = () => {
  const navigate = useNavigate()
  const { 
    estudiantes, 
    loading, 
    fetchEstudiantes, 
    deleteEstudiante,
    setEstudianteSeleccionado 
  } = useEstudianteVinculacionStore()
  
  const deleteModal = useModal()

  useEffect(() => {
    fetchEstudiantes()
  }, [fetchEstudiantes])

  const handleEdit = (estudiante) => {
    setEstudianteSeleccionado(estudiante)
    navigate(`${estudiante.estudiante.id}/editar`)
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
        // El microservicio usa firts_name (con error tipográfico) o first_name
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
          <h1 className="text-2xl font-bold text-gray-900">Estudiantes de Vinculación</h1>
          <p className="text-gray-500">Gestión de estudiantes en programa de vinculación</p>
        </div>
        <Button onClick={() => navigate('nuevo')}>
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Estudiante
        </Button>
      </div>

      <Card padding={false}>
        <Table
          columns={columns}
          data={estudiantes}
          loading={loading}
          emptyMessage="No hay estudiantes de vinculación registrados"
        />
      </Card>

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
