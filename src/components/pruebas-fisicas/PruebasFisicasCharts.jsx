import React, { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { FiActivity, FiTrendingUp, FiUsers, FiBarChart2, FiTarget, FiClock, FiPrinter, FiSearch } from 'react-icons/fi'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

const TIPO_LABELS = {
  'FUERZA': 'Fuerza (Salto Horizontal)',
  'VELOCIDAD': 'Velocidad',
  'AGILIDAD': 'Agilidad (ZigZag)'
}

const TIPO_COLORS = {
  'FUERZA': '#3B82F6',
  'VELOCIDAD': '#10B981',
  'AGILIDAD': '#F59E0B'
}

// Calcular desviación estándar
const calcularDesviacion = (valores) => {
  if (!valores || valores.length < 2) return 0
  const media = valores.reduce((a, b) => a + b, 0) / valores.length
  const varianza = valores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / valores.length
  return Math.sqrt(varianza)
}

// Clasificación de rendimiento según tipo de prueba
const clasificarRendimiento = (tipo, resultado) => {
  if (tipo === 'FUERZA') {
    // Salto horizontal en cm - más es mejor
    if (resultado >= 250) return { nivel: 'Excelente', color: 'text-green-600 bg-green-100' }
    if (resultado >= 220) return { nivel: 'Muy Bueno', color: 'text-blue-600 bg-blue-100' }
    if (resultado >= 190) return { nivel: 'Bueno', color: 'text-cyan-600 bg-cyan-100' }
    if (resultado >= 160) return { nivel: 'Regular', color: 'text-yellow-600 bg-yellow-100' }
    return { nivel: 'A mejorar', color: 'text-red-600 bg-red-100' }
  } else {
    // Velocidad y agilidad en segundos - menos es mejor
    if (resultado <= 4.5) return { nivel: 'Excelente', color: 'text-green-600 bg-green-100' }
    if (resultado <= 5.0) return { nivel: 'Muy Bueno', color: 'text-blue-600 bg-blue-100' }
    if (resultado <= 5.5) return { nivel: 'Bueno', color: 'text-cyan-600 bg-cyan-100' }
    if (resultado <= 6.0) return { nivel: 'Regular', color: 'text-yellow-600 bg-yellow-100' }
    return { nivel: 'A mejorar', color: 'text-red-600 bg-red-100' }
  }
}

const PruebasFisicasCharts = ({ pruebas = [], onPrint }) => {
  const [activeTab, setActiveTab] = useState('resumen')
  const [selectedAtleta, setSelectedAtleta] = useState('todos')
  const [atletaSearch, setAtletaSearch] = useState('')

  // Calcular estadísticas generales
  const estadisticas = useMemo(() => {
    if (!pruebas.length) return null

    const activas = pruebas.filter(p => p.estado)
    const porTipo = {}
    const porAtleta = {}
    const porSemestre = {}

    activas.forEach(p => {
      // Por tipo
      if (!porTipo[p.tipo_prueba]) {
        porTipo[p.tipo_prueba] = { resultados: [], count: 0 }
      }
      porTipo[p.tipo_prueba].resultados.push(parseFloat(p.resultado))
      porTipo[p.tipo_prueba].count++

      // Por atleta
      const atletaKey = p.atleta
      const atletaNombre = p.persona ? `${p.persona.nombre} ${p.persona.apellido}` : `Atleta ${p.atleta}`
      if (!porAtleta[atletaKey]) {
        porAtleta[atletaKey] = { nombre: atletaNombre, pruebas: [], tipos: {} }
      }
      porAtleta[atletaKey].pruebas.push(p)
      if (!porAtleta[atletaKey].tipos[p.tipo_prueba]) {
        porAtleta[atletaKey].tipos[p.tipo_prueba] = []
      }
      porAtleta[atletaKey].tipos[p.tipo_prueba].push(parseFloat(p.resultado))

      // Por semestre
      const semestre = p.semestre || 'Sin semestre'
      if (!porSemestre[semestre]) {
        porSemestre[semestre] = { count: 0, tipos: {} }
      }
      porSemestre[semestre].count++
      if (!porSemestre[semestre].tipos[p.tipo_prueba]) {
        porSemestre[semestre].tipos[p.tipo_prueba] = []
      }
      porSemestre[semestre].tipos[p.tipo_prueba].push(parseFloat(p.resultado))
    })

    // Calcular promedios por tipo
    const promediosPorTipo = Object.entries(porTipo).map(([tipo, data]) => ({
      tipo,
      label: TIPO_LABELS[tipo] || tipo,
      promedio: data.resultados.reduce((a, b) => a + b, 0) / data.resultados.length,
      max: Math.max(...data.resultados),
      min: Math.min(...data.resultados),
      count: data.count,
      desviacion: calcularDesviacion(data.resultados)
    }))

    // Ranking de atletas por cada tipo
    const rankingsPorTipo = {}
    Object.keys(TIPO_LABELS).forEach(tipo => {
      const atletasConTipo = Object.entries(porAtleta)
        .filter(([, data]) => data.tipos[tipo]?.length > 0)
        .map(([id, data]) => {
          const resultados = data.tipos[tipo]
          const mejor = tipo === 'FUERZA' 
            ? Math.max(...resultados) // Más es mejor para fuerza
            : Math.min(...resultados) // Menos es mejor para velocidad/agilidad
          return {
            id,
            nombre: data.nombre,
            mejor,
            promedio: resultados.reduce((a, b) => a + b, 0) / resultados.length,
            totalPruebas: resultados.length
          }
        })
        .sort((a, b) => tipo === 'FUERZA' ? b.mejor - a.mejor : a.mejor - b.mejor)
      
      rankingsPorTipo[tipo] = atletasConTipo.slice(0, 5) // Top 5
    })

    // Datos para gráficos
    const datosDistribucionTipos = Object.entries(porTipo).map(([tipo, data]) => ({
      name: TIPO_LABELS[tipo] || tipo,
      value: data.count,
      color: TIPO_COLORS[tipo]
    }))

    const datosSemestre = Object.entries(porSemestre)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([semestre, data]) => {
        const resultado = { semestre, total: data.count }
        Object.keys(TIPO_LABELS).forEach(tipo => {
          const valores = data.tipos[tipo] || []
          resultado[tipo] = valores.length > 0 
            ? valores.reduce((a, b) => a + b, 0) / valores.length 
            : 0
        })
        return resultado
      })

    return {
      totalPruebas: activas.length,
      totalAtletas: Object.keys(porAtleta).length,
      porTipo: promediosPorTipo,
      porAtleta,
      porSemestre: datosSemestre,
      distribucionTipos: datosDistribucionTipos,
      rankings: rankingsPorTipo,
      ultimaPrueba: activas.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))[0]
    }
  }, [pruebas])

  // Datos para radar chart por atleta
  const datosRadarAtleta = useMemo(() => {
    if (!estadisticas || selectedAtleta === 'todos') return null

    const atletaData = estadisticas.porAtleta[selectedAtleta]
    if (!atletaData) return null

    return Object.keys(TIPO_LABELS).map(tipo => {
      const valores = atletaData.tipos[tipo] || []
      const promTipo = estadisticas.porTipo.find(t => t.tipo === tipo)
      const promGeneral = promTipo?.promedio || 0
      
      let valor = 0
      if (valores.length > 0) {
        const promAtleta = valores.reduce((a, b) => a + b, 0) / valores.length
        // Normalizar: para fuerza más es mejor, para otros menos es mejor
        if (tipo === 'FUERZA') {
          valor = promGeneral > 0 ? (promAtleta / promGeneral) * 100 : 100
        } else {
          valor = promAtleta > 0 ? (promGeneral / promAtleta) * 100 : 100
        }
      }
      
      return {
        tipo: TIPO_LABELS[tipo],
        valor: Math.min(150, Math.max(0, valor)), // Limitar entre 0-150%
        fullMark: 150
      }
    })
  }, [estadisticas, selectedAtleta])

  // Lista de atletas para el selector
  const listaAtletas = useMemo(() => {
    if (!estadisticas) return []
    return Object.entries(estadisticas.porAtleta).map(([id, data]) => ({
      id,
      nombre: data.nombre
    })).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [estadisticas])

  // Filtrar atletas por búsqueda
  const atletasFiltrados = useMemo(() => {
    if (!atletaSearch.trim()) return listaAtletas
    const search = atletaSearch.toLowerCase()
    return listaAtletas.filter(a => a.nombre.toLowerCase().includes(search))
  }, [listaAtletas, atletaSearch])

  if (!estadisticas) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <FiBarChart2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay datos suficientes para mostrar estadísticas</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: FiActivity },
    { id: 'comparativa', label: 'Comparativa', icon: FiBarChart2 },
    { id: 'evolucion', label: 'Evolución', icon: FiTrendingUp },
    { id: 'atleta', label: 'Por Atleta', icon: FiUsers }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none" id="charts-section">
      {/* Header con tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiActivity className="w-6 h-6 text-blue-600" />
          Estadísticas y Análisis
        </h2>
        <div className="flex items-center gap-2">
          {onPrint && (
            <button
              onClick={onPrint}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 print:hidden"
            >
              <FiPrinter className="w-4 h-4" />
              Imprimir
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4 print:hidden">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel de Resumen */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Cards de estadísticas generales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <FiActivity className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{estadisticas.totalPruebas}</p>
              <p className="text-sm opacity-80">Pruebas Totales</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <FiUsers className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{estadisticas.totalAtletas}</p>
              <p className="text-sm opacity-80">Atletas Evaluados</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
              <FiTarget className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{estadisticas.porTipo.length}</p>
              <p className="text-sm opacity-80">Tipos de Prueba</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <FiClock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{estadisticas.porSemestre.length}</p>
              <p className="text-sm opacity-80">Semestres</p>
            </div>
          </div>

          {/* Promedios por tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {estadisticas.porTipo.map(tipo => {
              const clasificacion = clasificarRendimiento(tipo.tipo, tipo.promedio)
              return (
                <div key={tipo.tipo} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-800">{tipo.label}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${clasificacion.color}`}>
                      {clasificacion.nivel}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Promedio:</span>
                      <span className="font-medium">{tipo.promedio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mejor:</span>
                      <span className="font-medium text-green-600">
                        {tipo.tipo === 'FUERZA' ? tipo.max.toFixed(2) : tipo.min.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total pruebas:</span>
                      <span className="font-medium">{tipo.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Desv. Estándar:</span>
                      <span className="font-medium">±{tipo.desviacion.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gráfico de distribución */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Distribución por Tipo de Prueba</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={estadisticas.distribucionTipos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estadisticas.distribucionTipos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Pruebas por Semestre</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={estadisticas.porSemestre}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semestre" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3B82F6" name="Total Pruebas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Panel Comparativo */}
      {activeTab === 'comparativa' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Comparativa de Promedios por Tipo</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={estadisticas.porTipo} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={120} />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
                <Bar dataKey="min" fill="#EF4444" name="Mínimo" />
                <Bar dataKey="promedio" fill="#3B82F6" name="Promedio" />
                <Bar dataKey="max" fill="#10B981" name="Máximo" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla detallada */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo de Prueba</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Pruebas</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Promedio</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Mínimo</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Máximo</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Desv. Est.</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Clasificación</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {estadisticas.porTipo.map(tipo => {
                  const clasificacion = clasificarRendimiento(tipo.tipo, tipo.promedio)
                  return (
                    <tr key={tipo.tipo} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{tipo.label}</td>
                      <td className="px-4 py-3 text-center">{tipo.count}</td>
                      <td className="px-4 py-3 text-center font-semibold">{tipo.promedio.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-red-600">{tipo.min.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-green-600">{tipo.max.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">±{tipo.desviacion.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${clasificacion.color}`}>
                          {clasificacion.nivel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel de Evolución */}
      {activeTab === 'evolucion' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Evolución de Promedios por Semestre</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={estadisticas.porSemestre}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semestre" />
                <YAxis />
                <Tooltip formatter={(value) => value > 0 ? value.toFixed(2) : 'N/A'} />
                <Legend />
                {Object.keys(TIPO_LABELS).map((tipo, index) => (
                  <Line
                    key={tipo}
                    type="monotone"
                    dataKey={tipo}
                    name={TIPO_LABELS[tipo]}
                    stroke={TIPO_COLORS[tipo] || COLORS[index]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Interpretación</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Fuerza (Salto):</strong> Valores más altos indican mejor rendimiento</li>
              <li>• <strong>Velocidad:</strong> Valores más bajos indican mejor rendimiento</li>
              <li>• <strong>Agilidad:</strong> Valores más bajos indican mejor rendimiento</li>
            </ul>
          </div>
        </div>
      )}

      {/* Panel por Atleta */}
      {activeTab === 'atleta' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="font-medium text-gray-700">Buscar Atleta:</label>
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Escriba el nombre del atleta..."
                value={atletaSearch}
                onChange={(e) => setAtletaSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lista filtrada de atletas */}
          {atletaSearch && atletasFiltrados.length > 0 && selectedAtleta === 'todos' && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {atletasFiltrados.map(atleta => (
                <button
                  key={atleta.id}
                  onClick={() => {
                    setSelectedAtleta(atleta.id)
                    setAtletaSearch(atleta.nombre)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                >
                  {atleta.nombre}
                </button>
              ))}
            </div>
          )}

          {atletaSearch && atletasFiltrados.length === 0 && (
            <p className="text-sm text-gray-500">No se encontraron atletas con ese nombre</p>
          )}

          {selectedAtleta !== 'todos' && (
            <button
              onClick={() => {
                setSelectedAtleta('todos')
                setAtletaSearch('')
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Limpiar selección
            </button>
          )}

          {selectedAtleta !== 'todos' && datosRadarAtleta && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Perfil de Rendimiento</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={datosRadarAtleta}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="tipo" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar
                      name="Rendimiento (%)"
                      dataKey="valor"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.5}
                    />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 text-center mt-2">
                  100% = Promedio del grupo | Mayor a 100% = Sobre el promedio
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Detalle del Atleta</h3>
                {estadisticas.porAtleta[selectedAtleta] && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-lg">{estadisticas.porAtleta[selectedAtleta].nombre}</p>
                      <p className="text-sm text-gray-500">
                        Total de pruebas: {estadisticas.porAtleta[selectedAtleta].pruebas.length}
                      </p>
                    </div>
                    
                    {Object.entries(estadisticas.porAtleta[selectedAtleta].tipos).map(([tipo, valores]) => {
                      const mejor = tipo === 'FUERZA' ? Math.max(...valores) : Math.min(...valores)
                      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length
                      const clasificacion = clasificarRendimiento(tipo, promedio)
                      
                      return (
                        <div key={tipo} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{TIPO_LABELS[tipo]}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${clasificacion.color}`}>
                              {clasificacion.nivel}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Mejor:</span>
                              <span className="ml-1 font-semibold text-green-600">{mejor.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Promedio:</span>
                              <span className="ml-1 font-semibold">{promedio.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Pruebas:</span>
                              <span className="ml-1 font-semibold">{valores.length}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedAtleta === 'todos' && (
            <div className="text-center py-8 text-gray-500">
              <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Seleccione un atleta para ver su perfil de rendimiento</p>
            </div>
          )}
        </div>
      )}

      {/* Panel de Rankings */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(estadisticas.rankings).map(([tipo, ranking]) => (
              <div key={tipo} className="border rounded-lg overflow-hidden">
                <div 
                  className="px-4 py-3 text-white font-semibold"
                  style={{ backgroundColor: TIPO_COLORS[tipo] || '#3B82F6' }}
                >
                  <div className="flex items-center gap-2">
                    <FiAward className="w-5 h-5" />
                    {TIPO_LABELS[tipo]}
                  </div>
                </div>
                <div className="divide-y">
                  {ranking.length > 0 ? ranking.map((atleta, index) => (
                    <div key={atleta.id} className="px-4 py-3 flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{atleta.nombre}</p>
                        <p className="text-xs text-gray-500">{atleta.totalPruebas} prueba(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{atleta.mejor.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">mejor</p>
                      </div>
                    </div>
                  )) : (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                      Sin datos disponibles
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">🏆 Criterios de Ranking</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• <strong>Fuerza:</strong> Ordenado por mejor salto (más alto es mejor)</li>
              <li>• <strong>Velocidad:</strong> Ordenado por mejor tiempo (más bajo es mejor)</li>
              <li>• <strong>Agilidad:</strong> Ordenado por mejor tiempo (más bajo es mejor)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default PruebasFisicasCharts
