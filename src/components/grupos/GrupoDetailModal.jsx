import { FiX, FiCreditCard, FiCheckCircle } from 'react-icons/fi'

const GrupoDetailModal = ({ grupo, onClose }) => {
  if (!grupo) return null

  const atletasActivos = grupo?.atletas?.filter(a => a?.inscripcion?.habilitada) || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {String(grupo.nombre || '').substring(0, 100)}
            </h2>
            <p className="text-blue-100">{String(grupo.categoria || '').substring(0, 50)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Información del Grupo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Rango de Edad</h3>
              <p className="text-2xl font-bold text-gray-900">
                {grupo.rango_edad_minima} - {grupo.rango_edad_maxima} años
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Entrenador</h3>
              {grupo.entrenador?.persona ? (
                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    {String(grupo.entrenador.persona.first_name || '').substring(0, 50)} {String(grupo.entrenador.persona.last_name || '').substring(0, 50)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {String(grupo.entrenador.persona.identification || '').substring(0, 20)}
                  </p>
                </div>
              ) : (
                <p className="text-xl font-semibold text-gray-900">ID: {Number(grupo.entrenador?.id || grupo.entrenador) || 'N/A'}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Fecha de Creación</h3>
              <p className="text-xl font-semibold text-gray-900">
                {new Date(grupo.fecha_creacion).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Lista de Atletas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Atletas del Grupo
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {atletasActivos.length} {atletasActivos.length === 1 ? 'atleta' : 'atletas'}
              </span>
            </div>

            {atletasActivos.length > 0 ? (
              <div className="space-y-3">
                {atletasActivos.map((atleta) => (
                  <div
                    key={atleta.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {String(atleta.persona?.first_name || atleta.persona?.firts_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {String(atleta.persona?.first_name || atleta.persona?.firts_name || '').substring(0, 50)} {String(atleta.persona?.last_name || '').substring(0, 50)}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <FiCreditCard className="w-4 h-4 mr-1" />
                              {String(atleta.persona?.identification || 'N/A').substring(0, 20)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {atleta.inscripcion?.habilitada && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                            Habilitado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No hay atletas asignados a este grupo</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default GrupoDetailModal
