/**
 * Componente InscripcionList
 * Tabla estilizada con Tailwind CSS para listar inscripciones
 * Incluye toggle de estado (habilitar/deshabilitar) y paginación
 */

import { FiEdit2, FiEye, FiToggleLeft, FiToggleRight, FiUser, FiCalendar } from 'react-icons/fi'
import { Table, Button, Card, Pagination } from '../common'
import { formatDate } from '../../utils/formatters'
import { paginateData, PAGINATION_CONFIG } from '../../utils/pagination'
import { useState, useMemo } from 'react'

const InscripcionList = ({ 
  inscripciones = [], 
  onEdit, 
  onView, 
  onToggleStatus, 
  loading = false 
}) => {
  // Estado de paginación local con valor por defecto de 10
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize)

  // Paginar datos
  const { data: paginatedInscripciones, pagination } = useMemo(() => {
    return paginateData(inscripciones, currentPage, pageSize)
  }, [inscripciones, currentPage, pageSize])

  // Handlers de paginación
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setCurrentPage(1) // Reset a primera página
  }
  // Definición de columnas de la tabla
  const columns = [
    {
      key: 'atleta',
      title: 'Atleta',
      render: (_, row) => {
        const persona = row.persona || {}
        const nombre = persona.firts_name || persona.first_name || 'Sin nombre'
        const apellido = persona.last_name || ''
        const identificacion = persona.identification || persona.dni || 'Sin ID'
        
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {nombre} {apellido}
              </span>
              <span className="text-xs text-gray-500">
                ID: {identificacion}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'fecha',
      title: 'Fecha Inscripción',
      render: (_, row) => {
        const fecha = row.inscripcion?.fecha_inscripcion || row.fecha_inscripcion
        return (
          <div className="flex items-center text-gray-600">
            <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm">
              {fecha ? formatDate(fecha) : 'N/A'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'tipo',
      title: 'Tipo',
      render: (_, row) => {
        const tipo = row.inscripcion?.tipo_inscripcion || row.tipo_inscripcion
        const isMayorEdad = tipo === 'MAYOR_EDAD'
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isMayorEdad 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {isMayorEdad ? 'Mayor de Edad' : 'Menor de Edad'}
          </span>
        )
      },
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (_, row) => {
        const habilitada = row.inscripcion?.habilitada ?? row.habilitada ?? true
        
        return (
          <div className="flex items-center">
            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
              habilitada ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${
              habilitada ? 'text-green-700' : 'text-red-700'
            }`}>
              {habilitada ? 'Habilitada' : 'Deshabilitada'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'acciones',
      title: 'Acciones',
      width: '160px',
      render: (_, row) => {
        const habilitada = row.inscripcion?.habilitada ?? row.habilitada ?? true
        
        return (
          <div className="flex items-center space-x-2">
            {/* Botón Ver Detalles */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(row)}
              title="Ver detalles"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <FiEye className="w-4 h-4" />
            </Button>
            
            {/* Botón Editar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(row)}
              title="Editar inscripción"
              className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
            >
              <FiEdit2 className="w-4 h-4" />
            </Button>
            
            {/* Toggle Estado - Interruptor Visual */}
            <button
              onClick={() => onToggleStatus?.(row)}
              title={habilitada ? 'Deshabilitar inscripción' : 'Habilitar inscripción'}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                habilitada 
                  ? 'bg-green-500 focus:ring-green-500' 
                  : 'bg-gray-300 focus:ring-gray-400'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full shadow-md ${
                  habilitada ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={paginatedInscripciones}
          loading={loading}
          emptyMessage="No se encontraron inscripciones registradas"
          className="min-w-full"
        />
      </div>
      
      {/* Paginación */}
      {!loading && inscripciones.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector={true}
        />
      )}
    </Card>
  )
}

export default InscripcionList
