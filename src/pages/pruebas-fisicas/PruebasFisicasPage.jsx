import React, { useEffect, useState, useRef, useMemo } from 'react'
import { FiPlus, FiSearch, FiPrinter, FiBarChart2, FiList, FiEye, FiX, FiFilter, FiDownload, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { usePruebaFisicaStore, useAuthStore } from '../../stores'
import { useModal } from '../../hooks'
import { Card, Button, Modal, ConfirmDialog } from '../../components/common'
import PruebasFisicasList from '../../components/pruebas-fisicas/PruebasFisicasList'
import PruebasFisicasForm from '../../components/pruebas-fisicas/PruebasFisicasForm'
import PruebasFisicasCharts from '../../components/pruebas-fisicas/PruebasFisicasCharts'

// Vista de tarjetas por atleta
const AtletaCards = ({ pruebas, onViewAtleta }) => {
  // Agrupar pruebas por atleta
  const atletasAgrupados = useMemo(() => {
    const grupos = {}
    pruebas.forEach(p => {
      const atletaId = p.atleta
      if (!grupos[atletaId]) {
        grupos[atletaId] = {
          id: atletaId,
          nombre: p.persona ? `${p.persona.nombre} ${p.persona.apellido}` : `Atleta ${atletaId}`,
          identificacion: p.persona?.identificacion || 'N/A',
          pruebas: [],
          tipos: {}
        }
      }
      grupos[atletaId].pruebas.push(p)
      if (!grupos[atletaId].tipos[p.tipo_prueba]) {
        grupos[atletaId].tipos[p.tipo_prueba] = []
      }
      grupos[atletaId].tipos[p.tipo_prueba].push(p)
    })
    return Object.values(grupos).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [pruebas])

  if (atletasAgrupados.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiUser className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay atletas con pruebas registradas</p>
      </div>
    )
  }

  const getTipoColor = (tipo) => {
    const colors = {
      'FUERZA': 'bg-blue-100 text-blue-700',
      'VELOCIDAD': 'bg-green-100 text-green-700',
      'AGILIDAD': 'bg-amber-100 text-amber-700'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-700'
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      'FUERZA': 'Fuerza (Salto Horizontal)',
      'VELOCIDAD': 'Velocidad',
      'AGILIDAD': 'Agilidad (ZigZag)'
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {atletasAgrupados.map(atleta => {
        const ultimaPrueba = atleta.pruebas.sort((a, b) => 
          new Date(b.fecha_registro) - new Date(a.fecha_registro)
        )[0]

        return (
          <div 
            key={atleta.id} 
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewAtleta(atleta)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{atleta.nombre}</h3>
                <p className="text-sm text-gray-500">{atleta.identificacion}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {atleta.pruebas.length} prueba(s)
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(atleta.tipos).map(([tipo, pruebasTipo]) => (
                <span key={tipo} className={`px-2 py-1 text-xs rounded-full ${getTipoColor(tipo)}`}>
                  {getTipoLabel(tipo)}: {pruebasTipo.length}
                </span>
              ))}
            </div>

            <div className="text-xs text-gray-400 border-t pt-2 mt-2">
              Última prueba: {ultimaPrueba?.fecha_registro || 'N/A'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Modal de detalle del atleta
const AtletaDetailModal = ({ isOpen, onClose, atleta, pruebas }) => {
  if (!atleta) return null

  const pruebasAtleta = pruebas.filter(p => p.atleta === atleta.id)
  const pruebasPorTipo = {}
  
  pruebasAtleta.forEach(p => {
    if (!pruebasPorTipo[p.tipo_prueba]) {
      pruebasPorTipo[p.tipo_prueba] = []
    }
    pruebasPorTipo[p.tipo_prueba].push(p)
  })

  const getTipoLabel = (tipo) => {
    const labels = {
      'FUERZA': 'Fuerza (Salto Horizontal)',
      'VELOCIDAD': 'Velocidad',
      'AGILIDAD': 'Agilidad (ZigZag)'
    }
    return labels[tipo] || tipo
  }

  const handlePrint = () => {
    const printContent = document.getElementById('atleta-detail-print')
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Pruebas Físicas - ${atleta.nombre}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1F2937; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
            th { background-color: #F3F4F6; }
            .header-info { margin-bottom: 20px; }
            .stats { background: #F9FAFB; padding: 10px; border-radius: 8px; margin: 10px 0; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Atleta" size="lg">
      <div className="space-y-6" id="atleta-detail-print">
        {/* Info del atleta */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <FiUser className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{atleta.nombre}</h2>
              <p className="text-blue-100 text-sm">ID: {atleta.identificacion}</p>
              <p className="text-sm text-blue-200">Total de pruebas: {pruebasAtleta.length}</p>
            </div>
          </div>
        </div>

        {/* Resumen por tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(pruebasPorTipo).map(([tipo, pruebasTipo]) => {
            const resultados = pruebasTipo.map(p => parseFloat(p.resultado))
            const mejor = tipo === 'FUERZA' ? Math.max(...resultados) : Math.min(...resultados)
            const promedio = resultados.reduce((a, b) => a + b, 0) / resultados.length

            return (
              <div key={tipo} className="border rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">{getTipoLabel(tipo)}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mejor:</span>
                    <span className="font-semibold text-green-600">{mejor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Promedio:</span>
                    <span className="font-semibold">{promedio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pruebas:</span>
                    <span className="font-semibold">{pruebasTipo.length}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Historial de pruebas */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Historial de Pruebas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Semestre</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-right">Resultado</th>
                  <th className="px-3 py-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pruebasAtleta
                  .sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))
                  .map(prueba => (
                    <tr key={prueba.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{prueba.fecha_registro}</td>
                      <td className="px-3 py-2">{prueba.semestre || 'N/A'}</td>
                      <td className="px-3 py-2">{getTipoLabel(prueba.tipo_prueba)}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        {prueba.resultado} {prueba.unidad_medida}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          prueba.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {prueba.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t print:hidden">
        <Button variant="secondary" onClick={handlePrint}>
          <FiPrinter className="w-4 h-4 mr-2" />
          Imprimir Reporte
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  )
}

const PruebasFisicasPage = () => {
  const { 
    pruebas, 
    loading, 
    fetchPruebas, 
    createPrueba, 
    updatePrueba, 
    toggleEstado
  } = usePruebaFisicaStore()
  
  const { user } = useAuthStore()
  const isEstudiante = user?.role === 'ESTUDIANTE_VINCULACION'
  const isEntrenador = user?.role === 'ENTRENADOR'
  const canCreate = isEstudiante || isEntrenador

  const [selectedPrueba, setSelectedPrueba] = useState(null)
  const [selectedAtleta, setSelectedAtleta] = useState(null)
  const [pruebaToDelete, setPruebaToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [semestreFilter, setSemestreFilter] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [viewMode, setViewMode] = useState('tabla') // 'tabla', 'atletas', 'estadisticas'
  const hasLoadedRef = useRef(false)
  
  const formModal = useModal()
  const deleteModal = useModal()
  const detailModal = useModal()
  const atletaModal = useModal()

  useEffect(() => {
    const loadPruebas = async () => {
      try {
        await fetchPruebas()
        if (!hasLoadedRef.current) {
          toast.success('Datos cargados correctamente', {
            duration: 2000,
            position: 'top-right',
          })
          hasLoadedRef.current = true
        }
      } catch (error) {
        toast.error('Error al cargar las pruebas físicas', {
          duration: 4000,
          position: 'top-right',
        })
      }
    }
    loadPruebas()
  }, [fetchPruebas])

  const handleCreate = () => {
    if (!canCreate) {
      toast.error('No tiene permisos para crear pruebas físicas', {
        duration: 4000,
        position: 'top-right',
      })
      return
    }
    setSelectedPrueba(null)
    formModal.open()
  }

  const handleEdit = (prueba) => {
    if (!canCreate) {
      toast.error('No tiene permisos para editar pruebas físicas', {
        duration: 4000,
        position: 'top-right',
      })
      return
    }
    setSelectedPrueba(prueba)
    formModal.open()
  }

  const handleViewDetail = (prueba) => {
    setSelectedPrueba(prueba)
    detailModal.open()
  }

  const handleViewAtleta = (atleta) => {
    setSelectedAtleta(atleta)
    atletaModal.open()
  }

  const handleToggleClick = (prueba) => {
    if (!canCreate) {
      toast.error('No tiene permisos para modificar el estado', {
        duration: 4000,
        position: 'top-right',
      })
      return
    }
    setPruebaToDelete(prueba)
    deleteModal.open()
  }

  const handleFormSubmit = async (values) => {
    try {
      if (selectedPrueba) {
        const updatePayload = {
          tipo_prueba: values.tipo_prueba,
          resultado: values.resultado,
          observaciones: values.observaciones || '',
          estado: values.estado
        }
        
        const result = await updatePrueba(selectedPrueba.id, updatePayload)
        
        if (result.success) {
          toast.success('Prueba física actualizada exitosamente', {
            duration: 3000,
            position: 'top-right',
          })
          await fetchPruebas()
          formModal.close()
        } else {
          toast.error(`${result.error || 'Error al actualizar la prueba'}`, {
            duration: 4000,
            position: 'top-right',
          })
        }
      } else {
        const result = await createPrueba(values)
        
        if (result.success) {
          toast.success('Prueba física creada exitosamente', {
            duration: 3000,
            position: 'top-right',
          })
          await fetchPruebas()
          formModal.close()
        } else {
          toast.error(`${result.error || 'Error al crear la prueba'}`, {
            duration: 4000,
            position: 'top-right',
          })
        }
      }
    } catch (error) {
      console.error('Error al guardar prueba:', error)
      toast.error('Error inesperado al guardar la prueba física', {
        duration: 4000,
        position: 'top-right',
      })
    }
  }

  const confirmToggle = async () => {
    if (!pruebaToDelete) return
    
    try {
      const result = await toggleEstado(pruebaToDelete.id)
      
      if (result.success) {
        toast.success(
          pruebaToDelete.estado 
            ? 'Prueba física desactivada' 
            : 'Prueba física activada',
          { duration: 3000, position: 'top-right' }
        )
        await fetchPruebas()
        deleteModal.close()
      } else {
        toast.error(result.error || 'Error al cambiar el estado', {
          duration: 4000,
          position: 'top-right',
        })
      }
    } catch (error) {
      toast.error('Error inesperado', { duration: 4000, position: 'top-right' })
    }
  }

  // Filtros
  const semestresDisponibles = useMemo(() => 
    [...new Set(pruebas.map(p => p.semestre).filter(Boolean))].sort().reverse(),
    [pruebas]
  )

  const tiposDisponibles = useMemo(() => 
    [...new Set(pruebas.map(p => p.tipo_prueba).filter(Boolean))],
    [pruebas]
  )

  const filteredPruebas = useMemo(() => {
    return pruebas.filter(p => {
      // Filtro de estado
      if (estadoFilter === 'activos' && !p.estado) return false
      if (estadoFilter === 'inactivos' && p.estado) return false

      // Filtro de semestre
      if (semestreFilter !== 'todos' && p.semestre !== semestreFilter) return false

      // Filtro de tipo
      if (tipoFilter !== 'todos' && p.tipo_prueba !== tipoFilter) return false

      // Filtro de búsqueda
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const nombreCompleto = `${p.persona?.nombre || ''} ${p.persona?.apellido || ''}`.toLowerCase()
        const identificacion = (p.persona?.identificacion || '').toLowerCase()
        const tipo = (p.tipo_prueba || '').toLowerCase()
        
        return nombreCompleto.includes(search) || 
               identificacion.includes(search) || 
               tipo.includes(search)
      }
      
      return true
    })
  }, [pruebas, searchTerm, semestreFilter, tipoFilter, estadoFilter])

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const activas = pruebas.filter(p => p.estado)
    const atletas = new Set(activas.map(p => p.atleta)).size
    const semestres = new Set(activas.map(p => p.semestre).filter(Boolean)).size
    
    return {
      total: activas.length,
      atletas,
      semestres,
      tipos: new Set(activas.map(p => p.tipo_prueba)).size
    }
  }, [pruebas])

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')
    const fecha = new Date().toLocaleDateString('es-ES')
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Pruebas Físicas - ${fecha}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1F2937; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-card { background: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #3B82F6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
            th { background-color: #3B82F6; color: white; }
            tr:nth-child(even) { background-color: #F9FAFB; }
            .footer { margin-top: 30px; text-align: center; color: #6B7280; font-size: 12px; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>Reporte de Pruebas Físicas</h1>
          <p>Fecha de generación: ${fecha}</p>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.total}</div>
              <div>Pruebas Totales</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.atletas}</div>
              <div>Atletas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.semestres}</div>
              <div>Semestres</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Atleta</th>
                <th>Identificación</th>
                <th>Fecha</th>
                <th>Semestre</th>
                <th>Tipo</th>
                <th>Resultado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPruebas.map(p => `
                <tr>
                  <td>${p.persona ? `${p.persona.nombre} ${p.persona.apellido}` : `Atleta ${p.atleta}`}</td>
                  <td>${p.persona?.identificacion || 'N/A'}</td>
                  <td>${p.fecha_registro}</td>
                  <td>${p.semestre || 'N/A'}</td>
                  <td>${p.tipo_prueba}</td>
                  <td>${p.resultado} ${p.unidad_medida}</td>
                  <td>${p.estado ? 'Activo' : 'Inactivo'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Sistema de Gestión de Baloncesto</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      'FUERZA': 'Fuerza (Salto Horizontal)',
      'VELOCIDAD': 'Velocidad',
      'AGILIDAD': 'Agilidad (ZigZag)'
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pruebas Físicas</h1>
          <p className="text-gray-500">Gestión y análisis de rendimiento físico de atletas</p>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="flex gap-3">
          <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
            <p className="text-lg font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-blue-500">Pruebas</p>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg text-center">
            <p className="text-lg font-bold text-green-600">{stats.atletas}</p>
            <p className="text-xs text-green-500">Atletas</p>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-lg text-center">
            <p className="text-lg font-bold text-purple-600">{stats.semestres}</p>
            <p className="text-xs text-purple-500">Semestres</p>
          </div>
        </div>
      </div>

      {/* Controles */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Selector de vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('tabla')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'tabla' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiList className="w-4 h-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('atletas')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'atletas' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiUser className="w-4 h-4" />
              Por Atleta
            </button>
            <button
              onClick={() => setViewMode('estadisticas')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'estadisticas' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiBarChart2 className="w-4 h-4" />
              Estadísticas
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 flex-1">
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>

            <select
              value={semestreFilter}
              onChange={(e) => setSemestreFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="todos">Todos los semestres</option>
              {semestresDisponibles.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>

            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="todos">Todos los tipos</option>
              {tiposDisponibles.map(tipo => (
                <option key={tipo} value={tipo}>{getTipoLabel(tipo)}</option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar atleta o tipo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePrintReport}>
              <FiPrinter className="w-4 h-4 mr-2" />
              Reporte
            </Button>
            {canCreate && (
              <Button onClick={handleCreate}>
                <FiPlus className="w-4 h-4 mr-2" />
                Nueva Prueba
              </Button>
            )}
          </div>
        </div>

        {/* Mostrar filtros activos */}
        {(searchTerm || semestreFilter !== 'todos' || tipoFilter !== 'todos' || estadoFilter !== 'todos') && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                Búsqueda: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {semestreFilter !== 'todos' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                Semestre: {semestreFilter}
                <button onClick={() => setSemestreFilter('todos')} className="hover:text-green-900">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {tipoFilter !== 'todos' && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                Tipo: {getTipoLabel(tipoFilter)}
                <button onClick={() => setTipoFilter('todos')} className="hover:text-amber-900">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {estadoFilter !== 'todos' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                Estado: {estadoFilter === 'activos' ? 'Activos' : 'Inactivos'}
                <button onClick={() => setEstadoFilter('todos')} className="hover:text-purple-900">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            <button 
              onClick={() => {
                setSearchTerm('')
                setSemestreFilter('todos')
                setTipoFilter('todos')
                setEstadoFilter('todos')
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar todos
            </button>
          </div>
        )}
      </Card>

      {/* Contenido según vista */}
      {viewMode === 'tabla' && (
        <Card>
          <PruebasFisicasList 
            pruebas={filteredPruebas}
            loading={loading}
            onEdit={handleEdit}
            onToggleEstado={handleToggleClick}
            onViewDetail={handleViewDetail}
          />
        </Card>
      )}

      {viewMode === 'atletas' && (
        <Card>
          <AtletaCards 
            pruebas={filteredPruebas}
            onViewAtleta={handleViewAtleta}
          />
        </Card>
      )}

      {viewMode === 'estadisticas' && (
        <PruebasFisicasCharts 
          pruebas={filteredPruebas}
          onPrint={handlePrintReport}
        />
      )}

      {/* Modal de Formulario */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={selectedPrueba ? 'Editar Prueba Física' : 'Nueva Prueba Física'}
      >
        <PruebasFisicasForm
          initialData={selectedPrueba}
          onSubmit={handleFormSubmit}
          onCancel={formModal.close}
          loading={loading}
        />
      </Modal>

      {/* Modal de Detalle de Prueba */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        title="Detalle de Prueba Física"
      >
        {selectedPrueba && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Atleta</label>
                <p className="font-medium">
                  {selectedPrueba.persona 
                    ? `${selectedPrueba.persona.nombre} ${selectedPrueba.persona.apellido}`
                    : `Atleta ${selectedPrueba.atleta}`}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Identificación</label>
                <p className="font-medium">{selectedPrueba.persona?.identificacion || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Fecha</label>
                <p className="font-medium">{selectedPrueba.fecha_registro}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Semestre</label>
                <p className="font-medium">{selectedPrueba.semestre || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Tipo de Prueba</label>
                <p className="font-medium">{getTipoLabel(selectedPrueba.tipo_prueba)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Resultado</label>
                <p className="font-medium text-lg text-blue-600">
                  {selectedPrueba.resultado} {selectedPrueba.unidad_medida}
                </p>
              </div>
            </div>
            {selectedPrueba.observaciones && (
              <div>
                <label className="text-sm text-gray-500">Observaciones</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700">
                  {selectedPrueba.observaciones}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={detailModal.close}>Cerrar</Button>
              {canCreate && (
                <Button onClick={() => {
                  detailModal.close()
                  handleEdit(selectedPrueba)
                }}>
                  Editar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Detalle del Atleta */}
      <AtletaDetailModal
        isOpen={atletaModal.isOpen}
        onClose={atletaModal.close}
        atleta={selectedAtleta}
        pruebas={pruebas}
      />

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={confirmToggle}
        title={pruebaToDelete?.estado ? "Desactivar Prueba" : "Activar Prueba"}
        message={`¿Estás seguro de que deseas ${pruebaToDelete?.estado ? 'desactivar' : 'activar'} esta prueba física?`}
        confirmText={pruebaToDelete?.estado ? "Desactivar" : "Activar"}
        variant={pruebaToDelete?.estado ? "danger" : "primary"}
        loading={loading}
      />
    </div>
  )
}

export default PruebasFisicasPage
