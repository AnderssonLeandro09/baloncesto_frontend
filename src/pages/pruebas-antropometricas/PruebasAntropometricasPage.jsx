/**
 * Página principal de Pruebas Antropométricas
 * TODO: Implementar por el integrante del equipo asignado
 */

import { Card, Button } from '../../components/common'
import { FiPlus } from 'react-icons/fi'

const PruebasAntropometricasPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pruebas Antropométricas</h1>
          <p className="text-gray-500">Gestión de mediciones antropométricas</p>
        </div>
        <Button>
          <FiPlus className="w-4 h-4 mr-2" />
          Nueva Prueba
        </Button>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          Módulo de Pruebas Antropométricas - Por implementar
        </p>
      </Card>
    </div>
  )
}

export default PruebasAntropometricasPage
