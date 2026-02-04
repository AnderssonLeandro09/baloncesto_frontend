/**
 * Página de Dashboard - Se muestra después del login
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
  { title: 'Entrenadores', value: '0', icon: FiUserCheck, color: 'bg-green-500' },
  { title: 'Grupos', value: '0', icon: FiLayers, color: 'bg-purple-500' },
  { title: 'Inscripciones', value: '0', icon: FiClipboard, color: 'bg-yellow-500' },
  { title: 'P. Antropométricas', value: '0', icon: FiActivity, color: 'bg-pink-500' },
  { title: 'P. Físicas', value: '0', icon: FiTarget, color: 'bg-indigo-500' },
]

const infoSections = [
  {
    title: 'Presentación del Club de Básquet UNL',
    accent: 'text-primary-700',
    paragraphs: [
      'El Club de Básquet de la Universidad Nacional de Loja (UNL) impulsa la formación integral de la comunidad universitaria, dirigido principalmente a docentes y estudiantes de la UNL.',
      'También está abierto a jóvenes externos con interés en integrarse al club, promoviendo la práctica del deporte, el ejercicio físico responsable y la vivencia de valores institucionales.',
    ],
  },
  {
    title: 'Formación y entrenamiento',
    accent: 'text-indigo-700',
    paragraphs: [
      'Los entrenamientos son guiados por entrenadores capacitados y acompañados por estudiantes de vinculación con la sociedad, garantizando rigor técnico y apoyo académico.',
      'Se ofrecen planes personalizados considerando características físicas y antropométricas, además de un seguimiento continuo y evaluaciones periódicas para medir el progreso de cada deportista.',
    ],
  },
  {
    title: 'Funcionalidades del sistema',
    accent: 'text-emerald-700',
    paragraphs: [
      'El Sistema de Gestión de Basketball apoya la administración, control y seguimiento de las actividades del club.',
      (
        <div className="space-y-3" key="funcionalidades-detalle">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Gestión Administrativa</span>
              <span className="text-sm text-gray-600">Organización y control</span>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Registro y administración de entrenadores.</li>
              <li>Creación y organización de grupos de entrenamiento.</li>
              <li>Gestión de inscripciones de deportistas internos y externos.</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Evaluación Deportiva</span>
              <span className="text-sm text-gray-600">Seguimiento basado en datos</span>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Registro y seguimiento de pruebas antropométricas.</li>
              <li>Registro de pruebas físicas.</li>
              <li>Historial de evaluaciones por deportista.</li>
              <li>Apoyo a la toma de decisiones técnicas basadas en datos.</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Accesibilidad y Control</span>
              <span className="text-sm text-gray-600">Seguridad y visibilidad</span>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Dashboard personalizado por usuario.</li>
              <li>Acceso seguro según el rol (entrenador, administrador).</li>
              <li>Visualización rápida del estado general del club.</li>
            </ul>
          </div>
          <p className="text-sm text-gray-700">
            Este sistema busca optimizar los procesos internos y mejorar la experiencia tanto de entrenadores como de deportistas.
          </p>
        </div>
      ),
    ],
  },
]

const DashboardPage = () => {
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

      {/* Sección informativa institucional */}
      <Card
        title="Sistema de Gestión de Basketball - Información"
        subtitle="Universidad Nacional de Loja"
        className="max-h-[520px] overflow-y-auto"
      >
        <div className="space-y-6">
          {infoSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-10 bg-gradient-to-b from-primary-500 to-indigo-500 rounded-full" />
                <div>
                  <h3 className={`text-lg font-bold uppercase tracking-wide ${section.accent}`}>
                    {section.title}
                  </h3>
                  <p className="text-xs font-semibold text-secondary-600">Enfoque institucional y deportivo</p>
                </div>
              </div>
              {section.paragraphs.map((text, idx) => (
                <div key={idx} className="text-sm text-gray-700 leading-relaxed space-y-2">
                  {text}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-8">
          <div className="rounded-xl bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 text-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-inner">
            <div className="text-sm font-semibold tracking-wide uppercase">© 2026 Carrera de Computación</div>
            <div className="text-sm text-gray-100 font-medium">Desarrollado por Christian Robles, Darwin Sarango, Justin Tapia y Anderson Amboludi</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage
