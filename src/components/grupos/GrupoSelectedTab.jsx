/**
 * Tab de atletas seleccionados
 */

import { FiX, FiUsers, FiAlertCircle } from 'react-icons/fi'
import { GRUPO_ATLETA_CONSTRAINTS } from '../../utils/grupoAtletaValidators'

export const GrupoSelectedTab = ({ atletasSeleccionadosInfo, toggleAtleta, error }) => {
  const isOverLimit = atletasSeleccionadosInfo.length > GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount

  return (
    <div className="space-y-4">
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600 flex items-center">
            <FiAlertCircle className="w-4 h-4 mr-2" />
            {Array.isArray(error) ? error.join(', ') : error}
          </p>
        </div>
      )}

      {/* Contador de seleccionados */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${isOverLimit ? 'bg-red-50' : 'bg-blue-50'}`}>
        <div className={`flex items-center space-x-2 ${isOverLimit ? 'text-red-700' : 'text-blue-700'}`}>
          <FiUsers size={20} />
          <span className="font-semibold">
            {atletasSeleccionadosInfo.length} {atletasSeleccionadosInfo.length === 1 ? 'atleta seleccionado' : 'atletas seleccionados'}
          </span>
        </div>
        <span className={`text-sm ${isOverLimit ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          Máximo: {GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount}
        </span>
      </div>

      {/* Advertencia si excede el límite */}
      {isOverLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600 flex items-center">
            <FiAlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            Has seleccionado demasiados atletas. Por favor, elimina {atletasSeleccionadosInfo.length - GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount} atleta(s) para poder guardar el grupo.
          </p>
        </div>
      )}

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
