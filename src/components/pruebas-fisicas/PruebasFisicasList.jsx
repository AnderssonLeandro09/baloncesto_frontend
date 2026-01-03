import React from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Table } from '../common'

const PruebasFisicasList = ({ pruebas, loading, onEdit, onToggleEstado }) => {
  const columns = [
    {
      key: 'atleta',
      title: 'Atleta',
      render: (_, row) => {
        const { persona } = row
        if (persona) {
          return `${persona.nombre} ${persona.apellido}`
        }
        return `Atleta ID: ${row.atleta}`
      }
    },
    {
      key: 'identificacion',
      title: 'Identificación',
      render: (_, row) => row.persona?.identificacion || 'N/A'
    },
    {
      key: 'fecha_registro',
      title: 'Fecha',
    },
    {
      key: 'tipo_prueba',
      title: 'Tipo',
      render: (tipo) => {
        const labels = {
          'FUERZA': 'Fuerza',
          'VELOCIDAD': 'Velocidad',
          'AGILIDAD': 'Agilidad'
        }
        return labels[tipo] || tipo
      }
    },
    {
      key: 'resultado',
      title: 'Resultado',
      render: (val, row) => `${val} ${row.unidad_medida}`
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (estado) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {estado ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Editar"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleEstado(row)}
            className={`p-1 rounded hover:bg-gray-100 ${row.estado ? 'text-red-600' : 'text-green-600'}`}
            title={row.estado ? 'Desactivar' : 'Activar'}
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={pruebas}
      loading={loading}
      emptyMessage="No hay pruebas físicas registradas"
    />
  )
}

export default PruebasFisicasList
