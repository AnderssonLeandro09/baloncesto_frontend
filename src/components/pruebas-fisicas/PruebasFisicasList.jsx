import React from 'react'
import { FiEdit2, FiEye, FiCheck } from 'react-icons/fi'
import { Table } from '../common'

// Clasificación de rendimiento según tipo de prueba (basado en baloncesto)
const clasificarRendimiento = (tipo, resultado) => {
  if (tipo === 'FUERZA') {
    // Salto horizontal (cm): Excelente 260-300, Bueno 220-250, Regular <220
    if (resultado >= 260) return { nivel: 'Excelente', color: 'bg-green-100 text-green-700' }
    if (resultado >= 220) return { nivel: 'Bueno', color: 'bg-blue-100 text-blue-700' }
    if (resultado >= 190) return { nivel: 'Regular', color: 'bg-yellow-100 text-yellow-700' }
    return { nivel: 'A mejorar', color: 'bg-red-100 text-red-700' }
  } else if (tipo === 'VELOCIDAD') {
    // 30m velocidad (seg): Excelente 3.8-4.1, Bueno 4.2-4.4, Regular >4.6
    if (resultado <= 4.1) return { nivel: 'Excelente', color: 'bg-green-100 text-green-700' }
    if (resultado <= 4.4) return { nivel: 'Bueno', color: 'bg-blue-100 text-blue-700' }
    if (resultado <= 4.6) return { nivel: 'Regular', color: 'bg-yellow-100 text-yellow-700' }
    return { nivel: 'A mejorar', color: 'bg-red-100 text-red-700' }
  } else if (tipo === 'AGILIDAD') {
    // Zigzag (seg): Excelente ≤15.0, Bueno 15.1-16.0, Regular >16.5
    if (resultado <= 15.0) return { nivel: 'Excelente', color: 'bg-green-100 text-green-700' }
    if (resultado <= 16.0) return { nivel: 'Bueno', color: 'bg-blue-100 text-blue-700' }
    if (resultado <= 16.5) return { nivel: 'Regular', color: 'bg-yellow-100 text-yellow-700' }
    return { nivel: 'A mejorar', color: 'bg-red-100 text-red-700' }
  }
  return { nivel: 'N/A', color: 'bg-gray-100 text-gray-700' }
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
        <div className="flex space-x-2">
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(row)}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Ver detalle"
            >
              <FiEye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(row)}
            className={`p-1 rounded transition-colors ${
              row.estado 
                ? 'text-blue-600 hover:bg-blue-50' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={row.estado ? 'Editar' : 'No se puede editar una prueba inactiva'}
            disabled={!row.estado}
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          {onToggleEstado && (
            <button
              onClick={() => onToggleEstado(row)}
              title={row.estado ? 'Desactivar' : 'Activar'}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                row.estado 
                  ? 'bg-green-500 focus:ring-green-500' 
                  : 'bg-gray-300 focus:ring-gray-400'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full shadow-md ${
                  row.estado ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
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
