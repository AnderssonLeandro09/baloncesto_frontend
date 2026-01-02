/**
 * Página principal de Estudiantes de Vinculación
 * TODO: Implementar por el integrante del equipo asignado
 */

import { Routes, Route } from 'react-router-dom'
import EstudiantesVinculacionList from './EstudiantesVinculacionList'

const EstudiantesVinculacionPage = () => {
  return (
    <Routes>
      <Route index element={<EstudiantesVinculacionList />} />
    </Routes>
  )
}

export default EstudiantesVinculacionPage
