import React from 'react'
import { FiEdit2, FiEye, FiCheck, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { Table } from '../common'

// Función para sanitizar texto y prevenir XSS en renderizado
const sanitizeForDisplay = (text) => {
  if (!text) return 'N/A'
  return String(text)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Clasificación de rendimiento según tipo de prueba
const clasificarRendimiento = (tipo, resultado) => {
  if (tipo === 'FUERZA') {
    if (resultado >= 250) return { nivel: 'Excelente', color: 'bg-green-100 text-green-700' }
    if (resultado >= 220) return { nivel: 'Muy Bueno', color: 'bg-blue-100 text-blue-700' }
    if (resultado >= 190) return { nivel: 'Bueno', color: 'bg-cyan-100 text-cyan-700' }
    if (resultado >= 160) return { nivel: 'Regular', color: 'bg-yellow-100 text-yellow-700' }
    return { nivel: 'A mejorar', color: 'bg-red-100 text-red-700' }
  } else {
    if (resultado <= 4.5) return { nivel: 'Excelente', color: 'bg-green-100 text-green-700' }
    if (resultado <= 5.0) return { nivel: 'Muy Bueno', color: 'bg-blue-100 text-blue-700' }
    if (resultado <= 5.5) return { nivel: 'Bueno', color: 'bg-cyan-100 text-cyan-700' }
    if (resultado <= 6.0) return { nivel: 'Regular', color: 'bg-yellow-100 text-yellow-700' }
    return { nivel: 'A mejorar', color: 'bg-red-100 text-red-700' }
  }
}

const PruebasFisicasList = ({ pruebas, loading, onEdit, onViewDetail, onToggleEstado }) => {

  const columns = [
    {
      key: 'atleta',
      title: 'Atleta',
      render: (_, row) => {
        const { persona } = row
        if (persona) {
          return (
            <div>
              <p className="font-medium">{`${persona.nombre} ${persona.apellido}`}</p>
              <p className="text-xs text-gray-500">{persona.identificacion || 'N/A'}</p>
            </div>
          )
        }
        return `Atleta ID: ${row.atleta}`
      }
    },
    {
      key: 'fecha_registro',
      title: 'Fecha',
      render: (fecha) => (
        <span className="text-sm">{fecha}</span>
      )
    },
    {
      key: 'semestre',
      title: 'Semestre',
      render: (_, row) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
          {row.semestre || 'N/A'}
        </span>
      )
    },
    {
      key: 'tipo_prueba',
      title: 'Tipo',
      render: (tipo) => {
        const labels = {
          'FUERZA': 'Fuerza (Salto Horizontal)',
          'VELOCIDAD': 'Velocidad',
          'AGILIDAD': 'Agilidad (ZigZag)'
        }
        const colors = {
          'FUERZA': 'bg-blue-100 text-blue-700',
          'VELOCIDAD': 'bg-green-100 text-green-700',
          'AGILIDAD': 'bg-amber-100 text-amber-700'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tipo] || 'bg-gray-100'}`}>
            {labels[tipo] || tipo}
          </span>
        )
      }
    },
    {
      key: 'resultado',
      title: 'Resultado',
      render: (val, row) => {
        const clasificacion = clasificarRendimiento(row.tipo_prueba, parseFloat(val))
        return (
          <div className="text-center">
            <p className="font-semibold text-lg">{val}</p>
            <p className="text-xs text-gray-500">{row.unidad_medida}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${clasificacion.color}`}>
              {clasificacion.nivel}
            </span>
          </div>
        )
      }
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (estado) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
          estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {estado ? <FiCheck className="w-3 h-3" /> : null}
          {estado ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => (
        <div className="flex space-x-1">
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(row)}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Ver detalle"
            >
              <FiEye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Editar"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          {onToggleEstado && (
            <button
              onClick={() => onToggleEstado(row)}
              className={`p-1.5 rounded transition-colors ${
                row.estado 
                  ? 'text-amber-600 hover:bg-amber-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={row.estado ? 'Deshabilitar' : 'Habilitar'}
            >
              {row.estado ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
            </button>
          )}
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
