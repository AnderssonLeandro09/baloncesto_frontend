/**
 * Componente Sidebar - Menú lateral de navegación
 */

import { NavLink } from 'react-router-dom'
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
  { path: '/', icon: FiHome, label: 'Inicio' },
  { path: '/atletas', icon: FiUsers, label: 'Atletas' },
  { path: '/entrenadores', icon: FiUserCheck, label: 'Entrenadores' },
  { path: '/grupos', icon: FiLayers, label: 'Grupos' },
  { path: '/inscripciones', icon: FiClipboard, label: 'Inscripciones' },
  { path: '/pruebas-antropometricas', icon: FiActivity, label: 'Pruebas Antropométricas' },
  { path: '/pruebas-fisicas', icon: FiTarget, label: 'Pruebas Físicas' },
  { path: '/estudiantes-vinculacion', icon: FiBookOpen, label: 'Est. Vinculación' },
]

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">🏀 Basketball</h1>
      </div>
      
      {/* Navegación */}
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
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
