import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import {
  HomePage,
  LoginPage,
  DashboardPage,
  AtletasPage,
  EntrenadoresPage,
  GruposPage,
  InscripcionesPage,
  PruebasAntropometricasPage,
  PruebasFisicasPage,
  EstudiantesVinculacionPage,
  NotFoundPage,
  PerfilPage,
} from './pages'
import { useAuthStore } from './stores'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        
        {/* Rutas para ADMIN */}
        <Route 
          path="entrenadores/*" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EntrenadoresPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="estudiantes-vinculacion/*" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EstudiantesVinculacionPage />
            </ProtectedRoute>
          } 
        />

        {/* Rutas para ENTRENADOR */}
        <Route 
          path="grupos/*" 
          element={
            <ProtectedRoute allowedRoles={['ENTRENADOR']}>
              <GruposPage />
            </ProtectedRoute>
          } 
        />

        {/* Rutas compartidas ADMIN y ENTRENADOR */}
        <Route 
          path="inscripciones/*" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <InscripcionesPage />
            </ProtectedRoute>
          } 
        />

        {/* Rutas para ENTRENADOR y ESTUDIANTE_VINCULACION */}
        <Route 
          path="pruebas-antropometricas/*" 
          element={
            <ProtectedRoute allowedRoles={['ENTRENADOR', 'ESTUDIANTE_VINCULACION']}>
              <PruebasAntropometricasPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="pruebas-fisicas/*" 
          element={
            <ProtectedRoute allowedRoles={['ENTRENADOR', 'ESTUDIANTE_VINCULACION']}>
              <PruebasFisicasPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
