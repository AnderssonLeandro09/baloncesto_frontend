/**
 * Tab de atletas seleccionados
 */

import { FiX, FiUsers } from 'react-icons/fi'

export const GrupoSelectedTab = ({ atletasSeleccionadosInfo, toggleAtleta }) => {
  return (
    <div className="space-y-4">
      {/* Contador de seleccionados */}
      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-700">
          <FiUsers size={20} />
          <span className="font-semibold">
            {atletasSeleccionadosInfo.length} {atletasSeleccionadosInfo.length === 1 ? 'atleta seleccionado' : 'atletas seleccionados'}
          </span>
        </div>
      </div>

      {/* Lista de atletas seleccionados */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-80 overflow-y-auto">
          {atletasSeleccionadosInfo.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay atletas seleccionados. Ve a la pestaña "Buscar Atletas" para seleccionar atletas.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {atletasSeleccionadosInfo.map(atleta => (
                <div
                  key={atleta.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{atleta.nombre}</div>
                    <div className="text-sm text-gray-500">
                      ID: {atleta.identificacion} • {atleta.edad} años
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAtleta(atleta.id)}
                    className="ml-4 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Quitar atleta"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
