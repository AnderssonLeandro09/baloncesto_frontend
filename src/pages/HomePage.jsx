import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { FiArrowRight, FiUsers, FiActivity, FiAward, FiTrendingUp } from 'react-icons/fi'

const HomePage = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const features = [
    {
      icon: FiUsers,
      title: 'Gestión de Atletas',
      description: 'Administra perfiles completos de cada deportista'
    },
    {
      icon: FiActivity,
      title: 'Pruebas Físicas',
      description: 'Registra y analiza el rendimiento deportivo'
    },
    {
      icon: FiAward,
      title: 'Grupos de Entrenamiento',
      description: 'Organiza equipos por categorías y niveles'
    },
    {
      icon: FiTrendingUp,
      title: 'Análisis de Progreso',
      description: 'Visualiza estadísticas y evolución'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/home_hero.png)' }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-blue-900/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-300 rounded-full animate-float-delayed opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-float opacity-30"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-200 rounded-full animate-pulse opacity-50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="backdrop-blur-lg bg-black/30 border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FiActivity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Kallpa UNL</h1>
                  <p className="text-xs text-white/50">Baloncesto</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="group px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-400 hover:to-blue-500 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                >
                  Iniciar Sesión
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 text-blue-200 px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Sistema de Gestión Deportiva
                </div>
                
                {/* Main Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight animate-fade-in-up animation-delay-100">
                  Potencia el 
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 animate-gradient">
                    Rendimiento
                  </span>
                  de tus Atletas
                </h1>
                
                {/* Description */}
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
                  Plataforma integral para el seguimiento, análisis y mejora del desempeño 
                  deportivo en baloncesto universitario.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-300">
                  <button
                    onClick={() => navigate('/login')}
                    className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Comenzar Ahora
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right Content - Feature Cards */}
              <div className="grid grid-cols-2 gap-4 animate-fade-in-up animation-delay-400">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="group backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.03] hover:border-blue-400/30 cursor-default h-full flex flex-col"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm flex-grow">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '500+', label: 'Atletas Registrados' },
                { value: '50+', label: 'Entrenadores' },
                { value: '1000+', label: 'Pruebas Realizadas' },
                { value: '15+', label: 'Años de Experiencia' }
              ].map((stat) => (
                <div key={stat.label} className="text-center group cursor-default">
                  <p className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 group-hover:from-blue-300 group-hover:to-cyan-200 transition-all">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-white/10 backdrop-blur-sm bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-md flex items-center justify-center">
                  <FiActivity className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white/60 text-sm font-medium">Kallpa UNL - Baloncesto</span>
              </div>
              <p className="text-white/40 text-sm">
                © 2026 Universidad Nacional de Loja. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(-15px); }
          50% { transform: translateY(-25px) translateX(10px); }
          75% { transform: translateY(-5px) translateX(-5px); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  )
}

export default HomePage
