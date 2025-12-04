/**
 * Página principal de Estudiantes de Vinculación
 * TODO: Implementar por el integrante del equipo asignado
 */

import { Card, Button } from '../../components/common'
import { FiPlus } from 'react-icons/fi'

const EstudiantesVinculacionPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estudiantes de Vinculación</h1>
          <p className="text-gray-500">Gestión de estudiantes en programa de vinculación</p>
        </div>
        <Button>
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Estudiante
        </Button>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          Módulo de Estudiantes de Vinculación - Por implementar
        </p>
      </Card>
    </div>
  )
}

export default EstudiantesVinculacionPage
