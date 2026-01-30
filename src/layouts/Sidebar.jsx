/**
 * Componente Sidebar - Menú lateral de navegación colapsable
 */

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores'
import {
  FiHome,
  FiUserCheck,
  FiLayers,
  FiClipboard,
  FiActivity,
  FiTarget,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Inicio', roles: ['ADMIN', 'ENTRENADOR', 'ESTUDIANTE_VINCULACION'] },
  { path: '/dashboard/entrenadores', icon: FiUserCheck, label: 'Entrenadores', roles: ['ADMIN'] },
  { path: '/dashboard/grupos', icon: FiLayers, label: 'Grupos', roles: ['ENTRENADOR'] },
  { path: '/dashboard/inscripciones', icon: FiClipboard, label: 'Inscripciones', roles: ['ADMIN', 'ENTRENADOR'] },
  { path: '/dashboard/pruebas-antropometricas', icon: FiActivity, label: 'Pruebas Antropométricas', roles: ['ENTRENADOR', 'ESTUDIANTE_VINCULACION'] },
  { path: '/dashboard/pruebas-fisicas', icon: FiTarget, label: 'Pruebas Físicas', roles: ['ENTRENADOR', 'ESTUDIANTE_VINCULACION'] },
  { path: '/dashboard/estudiantes-vinculacion', icon: FiBookOpen, label: 'Est. Vinculación', roles: ['ADMIN'] },
]

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const user = useAuthStore((state) => state.user)
  const userRole = user?.role || ''

  const filteredMenu = menuItems.filter((item) => item.roles.includes(userRole))

  return (
    <aside 
      className={`relative bg-black min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-white/10 ${isCollapsed ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <FiActivity className="w-5 h-5 text-white" />
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-lg font-bold text-white whitespace-nowrap">Kallpa UNL</h1>
            <p className="text-xs text-white/40 whitespace-nowrap">Baloncesto</p>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-gray-700 transition-all duration-200 shadow-lg z-10 group"
        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {isCollapsed ? (
          <FiChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <FiChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        )}
      </button>
      
      {/* Navegación */}
      <nav className="flex-1 mt-6 px-3">
        <ul className="space-y-1">
          {filteredMenu.map((item, index) => (
            <li 
              key={item.path}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in"
            >
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                title={isCollapsed ? item.label : ''}
                className={({ isActive }) =>
                  `group flex items-center rounded-lg transition-all duration-200 ${
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-400'
                      : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-blue-400' : ''
                      }`} 
                    />
                    <span 
                      className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
                        isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </aside>
  )
}

export default Sidebar
