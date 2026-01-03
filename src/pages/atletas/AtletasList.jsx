/**
 * Lista de Atletas
 * TODO: Implementar por el integrante del equipo asignado
 */

import { useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Card, Button, Table } from '../../components/common'
import { useApi, useModal } from '../../hooks'
import { AtletaService } from '../../api'

const AtletasList = () => {
  const { data, loading, getAll } = useApi(AtletaService)
  const createModal = useModal()

  useEffect(() => {
    getAll()
  }, [getAll])

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'nombre_atleta', title: 'Nombre' },
    { key: 'apellido_atleta', title: 'Apellido' },
    { key: 'dni', title: 'DNI' },
    { key: 'edad', title: 'Edad' },
    { key: 'sexo', title: 'Sexo' },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
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
          <h1 className="text-2xl font-bold text-gray-900">Atletas</h1>
          <p className="text-gray-500">Gestión de atletas del sistema</p>
        </div>
        <Button onClick={() => createModal.open()}>
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Atleta
        </Button>
      </div>

      <Card padding={false}>
        <Table
          columns={columns}
          data={data?.results || []}
          loading={loading}
          emptyMessage="No hay atletas registrados"
        />
      </Card>
    </div>
  )
}

export default AtletasList
