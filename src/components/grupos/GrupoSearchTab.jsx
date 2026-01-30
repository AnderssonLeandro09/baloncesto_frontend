/**
 * Tab de búsqueda de atletas
 */

import { FiSearch, FiCheckSquare, FiSquare } from 'react-icons/fi'

export const GrupoSearchTab = ({
  atletasFiltrados,
  atletasSeleccionados,
  searchTerm,
  setSearchTerm,
  toggleAtleta,
  minEdad,
  maxEdad
}) => {
  const isAtletaSeleccionado = (atletaId) => atletasSeleccionados.includes(atletaId)

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o identificación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Información del rango de edad */}
      {minEdad && maxEdad && !isNaN(minEdad) && !isNaN(maxEdad) && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          Mostrando atletas entre <span className="font-semibold">{minEdad}</span> y{' '}
          <span className="font-semibold">{maxEdad}</span> años
          <span className="ml-2">({atletasFiltrados.length} disponibles)</span>
        </div>
      )}

      {/* Lista de atletas */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-80 overflow-y-auto">
          {atletasFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {minEdad && maxEdad 
                ? 'No hay atletas disponibles en este rango de edad'
                : 'Ingrese el rango de edad en la pestaña "Información" para ver atletas disponibles'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {atletasFiltrados.map(atleta => (
                <button
                  key={atleta.id}
                  type="button"
                  onClick={() => toggleAtleta(atleta.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isAtletaSeleccionado(atleta.id) ? (
                      <FiCheckSquare className="text-blue-600 flex-shrink-0" size={20} />
                    ) : (
                      <FiSquare className="text-gray-400 flex-shrink-0" size={20} />
                    )}
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{atleta.nombre}</div>
                      <div className="text-sm text-gray-500">ID: {atleta.identificacion}</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {atleta.edad} años
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
