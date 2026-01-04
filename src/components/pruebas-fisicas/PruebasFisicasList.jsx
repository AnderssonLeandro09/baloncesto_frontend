import React, { useState } from 'react'
import { FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi'
import { Table, Modal } from '../common'

// Función para sanitizar texto y prevenir XSS en renderizado
const sanitizeForDisplay = (text) => {
  if (!text) return 'N/A'
  return String(text)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const PruebasFisicasList = ({ pruebas, loading, onEdit, onToggleEstado }) => {
  const [selectedObservaciones, setSelectedObservaciones] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewObservaciones = (prueba) => {
    const labels = {
      'FUERZA': 'FUERZA (Salto Horizontal)',
      'VELOCIDAD': 'Velocidad y Agilidad (ZIGZAG)',
      'AGILIDAD': 'Velocidad y Agilidad (ZIGZAG)'
    }
    
    setSelectedObservaciones({
      atleta: prueba.persona ? `${prueba.persona.nombre} ${prueba.persona.apellido}` : `Atleta ID: ${prueba.atleta}`,
      tipo: labels[prueba.tipo_prueba] || prueba.tipo_prueba,
      fecha: prueba.fecha_registro,
      observaciones: prueba.observaciones || 'Sin observaciones'
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedObservaciones(null)
  }

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
      key: 'semestre',
      title: 'Semestre',
      render: (_, row) => row.semestre || 'N/A'
    },
    {
      key: 'tipo_prueba',
      title: 'Tipo',
      render: (tipo) => {
        const labels = {
          'FUERZA': 'Fuerza (Salto Horizontal)',
          'VELOCIDAD': 'Velocidad',
          'AGILIDAD': 'Agilidad (ZIGZAG)'
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
            onClick={() => handleViewObservaciones(row)}
            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
            title="Ver observaciones"
          >
            <FiFileText className="w-4 h-4" />
          </button>
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
    <>
      <Table
        columns={columns}
        data={pruebas}
        loading={loading}
        emptyMessage="No hay pruebas físicas registradas"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Observaciones de Prueba Física"
      >
        {selectedObservaciones && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Atleta:</label>
              <p className="text-gray-900 mt-1">{selectedObservaciones.atleta}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de Prueba:</label>
              <p className="text-gray-900 mt-1">{selectedObservaciones.tipo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha:</label>
              <p className="text-gray-900 mt-1">{selectedObservaciones.fecha}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Observaciones:</label>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md min-h-[100px] whitespace-pre-wrap">
                {selectedObservaciones.observaciones}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default PruebasFisicasList
