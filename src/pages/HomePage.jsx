import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores'

const HomePage = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏀</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kallpa UNL</h1>
                <p className="text-xs text-gray-500">Baloncesto</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 flex-1">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido Principal */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Sistema de Gestión Deportiva
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Potencia el 
                <span className="text-blue-600"> Rendimiento</span>
                <br />de tus Atletas
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Plataforma integral para el seguimiento, análisis y mejora del desempeño 
                deportivo en baloncesto universitario.
              </p>
            </div>

            {/* Imagen/Ilustración */}
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-72 h-72 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                  <span className="text-8xl lg:text-9xl">🏀</span>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 lg:w-32 lg:h-32 bg-yellow-400 rounded-2xl shadow-xl flex items-center justify-center animate-bounce-slow">
                  <span className="text-4xl lg:text-5xl">⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">© 2026 Universidad Nacional de Loja</p>
            <p className="text-xs text-gray-500 mt-1">Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
