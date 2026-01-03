/**
 * Página principal de Grupos de Atletas
 * TODO: Implementar por el integrante del equipo asignado
 */

import { Card, Button } from '../../components/common'
import { FiPlus } from 'react-icons/fi'

const GruposPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grupos de Atletas</h1>
          <p className="text-gray-500">Gestión de grupos de entrenamiento</p>
        </div>
        <Button>
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          Módulo de Grupos - Por implementar
        </p>
      </Card>
    </div>
  )
}

export default GruposPage
