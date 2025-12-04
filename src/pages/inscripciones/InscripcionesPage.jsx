/**
 * Página principal de Inscripciones
 * TODO: Implementar por el integrante del equipo asignado
 */

import { Card, Button } from '../../components/common'
import { FiPlus } from 'react-icons/fi'

const InscripcionesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inscripciones</h1>
          <p className="text-gray-500">Gestión de inscripciones de atletas</p>
        </div>
        <Button>
          <FiPlus className="w-4 h-4 mr-2" />
          Nueva Inscripción
        </Button>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          Módulo de Inscripciones - Por implementar
        </p>
      </Card>
    </div>
  )
}

export default InscripcionesPage
