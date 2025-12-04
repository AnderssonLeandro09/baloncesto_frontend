import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import AtletasPage from './pages/atletas/AtletasPage'
import EntrenadoresPage from './pages/entrenadores/EntrenadoresPage'
import GruposPage from './pages/grupos/GruposPage'
import InscripcionesPage from './pages/inscripciones/InscripcionesPage'
import PruebasAntropometricasPage from './pages/pruebas-antropometricas/PruebasAntropometricasPage'
import PruebasFisicasPage from './pages/pruebas-fisicas/PruebasFisicasPage'
import EstudiantesVinculacionPage from './pages/estudiantes-vinculacion/EstudiantesVinculacionPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="atletas/*" element={<AtletasPage />} />
        <Route path="entrenadores/*" element={<EntrenadoresPage />} />
        <Route path="grupos/*" element={<GruposPage />} />
        <Route path="inscripciones/*" element={<InscripcionesPage />} />
        <Route path="pruebas-antropometricas/*" element={<PruebasAntropometricasPage />} />
        <Route path="pruebas-fisicas/*" element={<PruebasFisicasPage />} />
        <Route path="estudiantes-vinculacion/*" element={<EstudiantesVinculacionPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
