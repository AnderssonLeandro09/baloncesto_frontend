import { FiUsers, FiEdit2, FiEye, FiCalendar, FiTrendingUp } from 'react-icons/fi'

const GrupoCard = ({ grupo, onEdit, onView, onToggleStatus }) => {
  const atletasHabilitados = grupo?.atletas?.filter(a => a?.inscripcion?.habilitada)?.length || 0
  const habilitado = !grupo.eliminado

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Header con gradiente */}
      <div className={`h-2 bg-gradient-to-r ${habilitado ? 'from-blue-500 to-blue-600' : 'from-gray-400 to-gray-500'}`} />

      <div className="p-6">
        {/* Título y estado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {grupo.nombre?.substring(0, 100)}
            </h3>
            <p className="text-sm text-gray-500">{grupo.categoria?.substring(0, 50)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            habilitado 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {habilitado ? 'Habilitado' : 'Deshabilitado'}
          </div>
        </div>

        {/* Información de edad */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <FiTrendingUp className="w-4 h-4 mr-2 text-blue-600" />
            <span className="font-medium">Rango de edad:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {Math.max(0, Math.min(150, Number(grupo.rango_edad_minima) || 0))} - {Math.max(0, Math.min(150, Number(grupo.rango_edad_maxima) || 0))} años
            </span>
          </div>
        </div>

        {/* Información del Entrenador */}
        {grupo.entrenador?.persona && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Entrenador</p>
            <p className="text-sm font-semibold text-gray-900">
              {String(grupo.entrenador.persona.first_name || '').substring(0, 50)} {String(grupo.entrenador.persona.last_name || '').substring(0, 50)}
            </p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <FiUsers className="w-5 h-5 mx-auto mb-1 text-gray-600" />
            <p className="text-2xl font-bold text-gray-900">{atletasHabilitados}</p>
            <p className="text-xs text-gray-500">Atletas activos</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <FiCalendar className="w-5 h-5 mx-auto mb-1 text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">
              {grupo.fecha_creacion && !isNaN(new Date(grupo.fecha_creacion)) 
                ? new Date(grupo.fecha_creacion).toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'short' 
                  })
                : 'N/A'
              }
            </p>
            <p className="text-xs text-gray-500">Fecha creación</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => onView(grupo)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <FiEye className="w-4 h-4 mr-1" />
            Ver
          </button>
          <button
            onClick={() => onEdit(grupo)}
            className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          {/* Toggle Estado */}
          <button
            onClick={() => onToggleStatus?.(grupo)}
            title={habilitado ? 'Deshabilitar grupo' : 'Habilitar grupo'}
            className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              habilitado 
                ? 'bg-green-500 focus:ring-green-500' 
                : 'bg-gray-300 focus:ring-gray-400'
            }`}
          >
            <span
              className={`inline-block w-5 h-5 transform transition-transform bg-white rounded-full shadow-md ${
                habilitado ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default GrupoCard
