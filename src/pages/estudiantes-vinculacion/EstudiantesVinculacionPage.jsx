/**
 * Página principal de Estudiantes de Vinculación
 * TODO: Implementar por el integrante del equipo asignado
 */

import { Routes, Route } from 'react-router-dom'
import EstudiantesVinculacionList from './EstudiantesVinculacionList'
import EstudianteVinculacionForm from './EstudianteVinculacionForm'

const EstudiantesVinculacionPage = () => {
  return (
    <Routes>
      <Route index element={<EstudiantesVinculacionList />} />
      <Route path="nuevo" element={<EstudianteVinculacionForm />} />
      <Route path=":id/editar" element={<EstudianteVinculacionForm />} />
    </Routes>
  )
}

export default EstudiantesVinculacionPage
