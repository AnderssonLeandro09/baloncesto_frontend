/**
 * Componente Header - Barra superior
 */

import { FiBell, FiUser, FiSettings } from 'react-icons/fi'

const Header = () => {
  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Título o breadcrumb */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Sistema de Gestión - Basketball
          </h2>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <FiBell className="w-5 h-5" />
          </button>
          
          {/* Configuración */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <FiSettings className="w-5 h-5" />
          </button>
          
          {/* Usuario */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Usuario</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
