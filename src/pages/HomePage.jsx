/**
 * Página de inicio - Dashboard
 */

import { Card } from '../components/common'
import {
  FiUsers,
  FiUserCheck,
  FiLayers,
  FiClipboard,
  FiActivity,
  FiTarget,
} from 'react-icons/fi'

const stats = [
  { title: 'Atletas', value: '0', icon: FiUsers, color: 'bg-blue-500' },
  { title: 'Entrenadores', value: '0', icon: FiUserCheck, color: 'bg-green-500' },
  { title: 'Grupos', value: '0', icon: FiLayers, color: 'bg-purple-500' },
  { title: 'Inscripciones', value: '0', icon: FiClipboard, color: 'bg-yellow-500' },
  { title: 'P. Antropométricas', value: '0', icon: FiActivity, color: 'bg-pink-500' },
  { title: 'P. Físicas', value: '0', icon: FiTarget, color: 'bg-indigo-500' },
]

const HomePage = () => {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Bienvenido al sistema de gestión de Basketball</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Accesos rápidos */}
      <Card title="Accesos Rápidos">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/atletas"
            className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <FiUsers className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Nuevo Atleta</span>
          </a>
          <a
            href="/inscripciones"
            className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <FiClipboard className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Nueva Inscripción</span>
          </a>
          <a
            href="/pruebas-antropometricas"
            className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <FiActivity className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Registrar Prueba</span>
          </a>
          <a
            href="/grupos"
            className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <FiLayers className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Ver Grupos</span>
          </a>
        </div>
      </Card>
    </div>
  )
}

export default HomePage
