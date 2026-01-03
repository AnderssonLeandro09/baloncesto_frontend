/**
 * Página principal de Pruebas Físicas
 * TODO: Implementar por el integrante del equipo asignado
 */

import { Card, Button } from '../../components/common'
import { FiPlus } from 'react-icons/fi'

const PruebasFisicasPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pruebas Físicas</h1>
          <p className="text-gray-500">Gestión de pruebas de rendimiento físico</p>
        </div>
        <Button>
          <FiPlus className="w-4 h-4 mr-2" />
          Nueva Prueba
        </Button>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          Módulo de Pruebas Físicas - Por implementar
        </p>
      </Card>
    </div>
  )
}

export default PruebasFisicasPage
