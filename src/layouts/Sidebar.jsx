/**
 * Componente Sidebar - Menú lateral de navegación
 */

import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores'
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiLayers,
  FiClipboard,
  FiActivity,
  FiTarget,
  FiBookOpen,
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
  const user = useAuthStore((state) => state.user)
  const userRole = user?.role || ''

  const filteredMenu = menuItems.filter((item) => item.roles.includes(userRole))

  return (
    <aside className="w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">🏀 Basketball</h1>
      </div>
      
      {/* Navegación */}
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
