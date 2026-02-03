/**
 * Componente InscripcionDetail
 * Vista de detalle de inscripción con diseño visual claro y organizado.
 * Muestra la información en cards separadas con buena jerarquía visual.
 * 
 * DISEÑO: Basado en las mejores prácticas del módulo Entrenadores.
 */

import { 
  FiUser, 
  FiHeart, 
  FiUsers, 
  FiFileText, 
  FiCalendar, 
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiActivity,
  FiDroplet,
  FiAlertCircle,
  FiCheckCircle,
  FiX
} from 'react-icons/fi'
import { Button, Card } from '../common'
import { formatDate } from '../../utils/formatters'

/**
 * Componente auxiliar para mostrar un campo de información
 */
const InfoField = ({ icon: Icon, label, value, className = '' }) => {
  const displayValue = value || 'No registrado'
  const isEmpty = !value
  
  return (
    <div className={`flex items-start space-x-2 ${className}`}>
      {Icon && (
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`w-4 h-4 ${isEmpty ? 'text-gray-300' : 'text-gray-500'}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-sm mt-0.5 ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
          {displayValue}
        </p>
      </div>
    </div>
  )
}

/**
 * Componente auxiliar para mostrar un badge de estado
 */
const StatusBadge = ({ isActive, activeText = 'Habilitada', inactiveText = 'Deshabilitada' }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
    isActive 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-100 text-red-800 border border-red-200'
  }`}>
    {isActive ? (
      <FiCheckCircle className="w-3.5 h-3.5 mr-1.5" />
    ) : (
      <FiAlertCircle className="w-3.5 h-3.5 mr-1.5" />
    )}
    {isActive ? activeText : inactiveText}
  </span>
)

/**
 * Componente auxiliar para sección con título
 */
const Section = ({ icon: Icon, title, children, className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'border-gray-200',
    purple: 'border-purple-200 bg-purple-50/30',
    green: 'border-green-200 bg-green-50/30',
    blue: 'border-blue-200 bg-blue-50/30',
    pink: 'border-pink-200 bg-pink-50/30',
  }
  
  const iconColors = {
    default: 'text-gray-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    pink: 'text-pink-600',
  }

  return (
    <Card className={`p-4 border ${variantStyles[variant]} ${className} flex flex-col`}>
      <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-100">
        {Icon && (
          <div className={`p-1.5 rounded-lg bg-white shadow-sm`}>
            <Icon className={`w-4 h-4 ${iconColors[variant]}`} />
          </div>
        )}
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </Card>
  )
}

/**
 * Componente principal de detalle de inscripción
 */
const InscripcionDetail = ({ inscripcion, onClose, onEdit, onToggleStatus }) => {
  if (!inscripcion) return null

  // Extraer datos de la estructura de la inscripción
  const persona = inscripcion.persona || {}
  const atleta = inscripcion.atleta || {}
  const inscripcionData = inscripcion.inscripcion || {}

  // Obtener nombre completo
  const nombreCompleto = `${persona.first_name || persona.firts_name || atleta.nombres || 'Sin nombre'} ${persona.last_name || atleta.apellidos || ''}`.trim()
  
  // Verificar si es menor de edad
  const edad = atleta.edad || 0
  const esMenor = edad < 18
  
  // Estado de la inscripción
  const habilitada = inscripcionData.habilitada ?? true
  
  // Formatear sexo para mostrar
  const formatSexo = (sexo) => {
    if (!sexo) return 'No registrado'
    if (sexo === 'M') return 'Masculino'
    if (sexo === 'F') return 'Femenino'
    return sexo // Para valores personalizados
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden w-full">
      {/* HEADER CON INFORMACIÓN PRINCIPAL */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg p-5 -mx-4 -mt-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Info principal del atleta */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <FiUser className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">{nombreCompleto}</h2>
              <p className="text-blue-100 text-sm">
                ID: {persona.identification || atleta.cedula || 'N/A'}
              </p>
              <div className="mt-2">
                <StatusBadge isActive={habilitada} />
              </div>
            </div>
          </div>
          
          {/* Badge de edad - más compacto y centrado */}
          <div className="flex flex-col items-center justify-center bg-white/10 rounded-xl px-4 py-3 min-w-[120px]">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
              esMenor 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {esMenor ? '👶 Menor de Edad' : '👤 Mayor de Edad'}
            </span>
            <p className="text-white font-semibold text-lg mt-2">
              {edad} <span className="text-blue-200 text-sm font-normal">años</span>
            </p>
          </div>
        </div>
      </div>

      {/* GRID DE SECCIONES - Ancho completo con cards de igual altura */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full px-1">
        
        {/* DATOS PERSONALES */}
        <Section icon={FiUser} title="Datos Personales" variant="blue" className="h-full">
          <div className="space-y-3">
            <InfoField 
              icon={FiUser} 
              label="Nombre Completo" 
              value={nombreCompleto} 
            />
            <InfoField 
              icon={FiFileText} 
              label="Cédula" 
              value={persona.identification || atleta.cedula} 
            />
            <InfoField 
              icon={FiPhone} 
              label="Teléfono" 
              value={persona.phono || atleta.telefono} 
            />
            <InfoField 
              icon={FiMail} 
              label="Correo Electrónico" 
              value={persona.email || atleta.email} 
            />
            <InfoField 
              icon={FiMapPin} 
              label="Dirección" 
              value={persona.direction || atleta.direccion} 
            />
          </div>
        </Section>

        {/* DATOS DEL ATLETA */}
        <Section icon={FiActivity} title="Datos del Atleta" variant="green" className="h-full">
          <div className="space-y-3">
            <InfoField 
              icon={FiCalendar} 
              label="Fecha de Nacimiento" 
              value={atleta.fecha_nacimiento ? formatDate(atleta.fecha_nacimiento) : null} 
            />
            <div className="grid grid-cols-2 gap-3">
              <InfoField 
                label="Edad" 
                value={atleta.edad ? `${atleta.edad} años` : null} 
              />
              <InfoField 
                label="Sexo" 
                value={formatSexo(atleta.sexo)} 
              />
            </div>
            <InfoField 
              icon={FiDroplet} 
              label="Tipo de Sangre" 
              value={atleta.tipo_sangre} 
            />
          </div>
        </Section>

        {/* INFORMACIÓN MÉDICA */}
        <Section icon={FiHeart} title="Información Médica" variant="pink" className="h-full">
          <div className="space-y-3">
            <InfoField 
              label="Alergias" 
              value={atleta.alergias} 
            />
            <InfoField 
              label="Enfermedades" 
              value={atleta.enfermedades} 
            />
            <InfoField 
              label="Medicamentos" 
              value={atleta.medicamentos} 
            />
            <InfoField 
              label="Lesiones" 
              value={atleta.lesiones} 
            />
          </div>
        </Section>

        {/* DATOS DE INSCRIPCIÓN */}
        <Section icon={FiFileText} title="Datos de Inscripción" variant="default" className="h-full">
          <div className="space-y-3">
            <InfoField 
              icon={FiCalendar} 
              label="Fecha de Inscripción" 
              value={inscripcionData.fecha_inscripcion ? formatDate(inscripcionData.fecha_inscripcion) : null} 
            />
            <InfoField 
              label="Tipo de Inscripción" 
              value={inscripcionData.tipo_inscripcion === 'MENOR_EDAD' ? 'Menor de Edad (con representante)' : 'Mayor de Edad'} 
            />
            <InfoField 
              icon={FiCalendar} 
              label="Fecha de Registro" 
              value={inscripcionData.fecha_creacion ? formatDate(inscripcionData.fecha_creacion) : null} 
            />
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Estado</p>
              <StatusBadge isActive={habilitada} />
            </div>
          </div>
        </Section>

        {/* DATOS DEL REPRESENTANTE (solo si es menor de edad) */}
        {esMenor && (
          <Section 
            icon={FiUsers} 
            title="Representante Legal" 
            variant="purple"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField 
                icon={FiUser} 
                label="Nombre Completo" 
                value={atleta.nombre_representante} 
              />
              <InfoField 
                icon={FiFileText} 
                label="Cédula" 
                value={atleta.cedula_representante} 
              />
              <InfoField 
                label="Parentesco" 
                value={atleta.parentesco_representante} 
              />
              <InfoField 
                icon={FiPhone} 
                label="Teléfono" 
                value={atleta.telefono_representante} 
              />
              <InfoField 
                icon={FiMail} 
                label="Correo Electrónico" 
                value={atleta.correo_representante} 
              />
              <InfoField 
                label="Ocupación" 
                value={atleta.ocupacion_representante} 
              />
              <InfoField 
                icon={FiMapPin} 
                label="Dirección" 
                value={atleta.direccion_representante} 
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
          </Section>
        )}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200 sticky bottom-0 bg-white py-3">
        <div className="order-2 sm:order-1">
          {onToggleStatus && (
            <Button
              variant={habilitada ? 'danger' : 'success'}
              size="sm"
              onClick={() => onToggleStatus(inscripcion)}
              className="w-full sm:w-auto"
            >
              {habilitada ? 'Deshabilitar' : 'Habilitar'} Inscripción
            </Button>
          )}
        </div>
        <div className="flex items-center justify-end space-x-3 order-1 sm:order-2">
          {onEdit && (
            <Button variant="secondary" onClick={() => onEdit(inscripcion)}>
              Editar
            </Button>
          )}
          <Button variant="primary" onClick={onClose}>
            <FiX className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InscripcionDetail
