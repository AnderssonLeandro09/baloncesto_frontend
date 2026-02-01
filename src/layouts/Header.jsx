/**
 * Componente Header - Barra superior
 */

import { FiUser, FiLogOut } from 'react-icons/fi'
import { useAuthStore } from '../stores'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
          {/* Usuario - Sección Clickable para Perfil */}
          <div className="flex items-center pl-4 border-l border-gray-200 gap-3">
            <button
              onClick={() => navigate('/dashboard/perfil')}
              className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-xl transition-all group"
              title="Ver mi perfil"
            >
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FiUser className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                  {user?.name || 'Usuario'}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role?.toLowerCase().replace('_', ' ')}
                </span>
              </div>
            </button>

            <button 
              onClick={handleLogout}
              className="p-2.5 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm hover:shadow-red-200"
              title="Cerrar Sesión"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
