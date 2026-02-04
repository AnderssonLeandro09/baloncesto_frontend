/**
 * Modal para mostrar detalles de un usuario (Entrenador o Estudiante)
 */

import { Modal } from '../common'
import { FiUser, FiPhone, FiMapPin, FiHash, FiUsers, FiBookOpen, FiAward } from 'react-icons/fi'

const UsuarioDetalleModal = ({ 
  isOpen, 
  onClose, 
  usuario, 
  tipo = 'entrenador' // 'entrenador' o 'estudiante'
}) => {
  if (!usuario) return null

  const { persona, entrenador, estudiante } = usuario

  const InfoItem = ({ icon: Icon, label, value, fullWidth = false }) => (
    <div className={`flex items-start space-x-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${fullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
      <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900 break-words leading-snug">{value || 'No especificado'}</p>
      </div>
    </div>
  )

  const getNombreCompleto = () => {
    if (!persona) return 'N/A'
    const firstName = persona.first_name || persona.firts_name || ''
    const lastName = persona.last_name || ''
    return `${firstName} ${lastName}`.trim() || 'N/A'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
            <FiUser className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {getNombreCompleto()}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {tipo === 'entrenador' ? 'Entrenador' : 'Estudiante de Vinculación'}
            </span>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4 py-1">
        {/* Información Personal */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center">
            <span className="w-1 h-5 bg-blue-600 rounded-full mr-3"></span>
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <InfoItem 
              icon={FiHash}
              label="Identificación"
              value={persona?.identification}
            />
            <InfoItem 
              icon={FiPhone}
              label="Teléfono"
              value={persona?.phono || persona?.phone}
            />
            <InfoItem 
              icon={FiMapPin}
              label="Dirección"
              value={persona?.direction || persona?.address}
            />
          </div>
        </div>

        {/* Información Específica */}
        {(entrenador || estudiante) && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center">
              <span className="w-1 h-5 bg-blue-600 rounded-full mr-3"></span>
              {tipo === 'entrenador' ? 'Datos Profesionales' : 'Datos Académicos'}
            </h3>
            
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tipo === 'entrenador' && entrenador && (
                  <>
                    <InfoItem 
                      icon={FiAward}
                      label="Especialidad"
                      value={entrenador.especialidad}
                      fullWidth
                    />
                    <InfoItem 
                      icon={FiUsers}
                      label="Club Asignado"
                      value={entrenador.club_asignado}
                      fullWidth
                    />
                  </>
                )}

                {tipo === 'estudiante' && estudiante && (
                  <>
                    <InfoItem 
                      icon={FiBookOpen}
                      label="Carrera"
                      value={estudiante.carrera}
                      fullWidth
                    />
                    <InfoItem 
                      icon={FiHash}
                      label="Semestre"
                      value={estudiante.semestre}
                      fullWidth
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default UsuarioDetalleModal
