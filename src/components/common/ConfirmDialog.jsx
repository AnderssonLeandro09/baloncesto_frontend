/**
 * Componente de diálogo de confirmación
 * Soporta diferentes variantes (danger, success, etc.)
 */

import Modal from './Modal'
import Button from './Button'
import { FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  loading = false,
}) => {
  // Configuración de iconos y colores según variante
  const variantConfig = {
    danger: {
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      Icon: FiAlertTriangle,
    },
    success: {
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      Icon: FiCheckCircle,
    },
    primary: {
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      Icon: FiInfo,
    },
  }

  const config = variantConfig[confirmVariant] || variantConfig.danger
  const { bgColor, iconColor, Icon } = config

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 w-full">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
