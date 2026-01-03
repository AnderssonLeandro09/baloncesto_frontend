/**
 * Página principal de Atletas
 */

import { Routes, Route } from 'react-router-dom'
import AtletasList from './AtletasList'

const AtletasPage = () => {
  return (
    <Routes>
      <Route index element={<AtletasList />} />
      {/* Agregar más rutas según sea necesario */}
      {/* <Route path="nuevo" element={<AtletaForm />} /> */}
      {/* <Route path=":id" element={<AtletaDetail />} /> */}
      {/* <Route path=":id/editar" element={<AtletaForm />} /> */}
    </Routes>
  )
}

export default AtletasPage
