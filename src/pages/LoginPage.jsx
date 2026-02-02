import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowLeft, FiAlertCircle, FiActivity } from 'react-icons/fi'
import { useForm } from '../hooks'
import { authService } from '../api'
import { useAuthStore } from '../stores'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const { values, errors, handleChange, setErrors } = useForm(
    { email: '', password: '' },
    (vals) => {
      const errors = {}
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!vals.email) {
        errors.email = 'El email es requerido'
      } else if (!emailRegex.test(vals.email)) {
        errors.email = 'Ingrese un correo electrónico válido'
      }

      if (!vals.password) {
        errors.password = 'La contraseña es requerida'
      } else if (vals.password.length < 4) {
        errors.password = 'La contraseña es muy corta'
      }
      
      return errors
    }
  )

  const validate = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!values.email) {
      newErrors.email = 'El email es requerido'
    } else if (!emailRegex.test(values.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido'
    }

    if (!values.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (values.password.length < 4) {
      newErrors.password = 'La contraseña es muy corta'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onLogin = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      toast.error('Por favor verifique los campos del formulario')
      return
    }

    setLoading(true)
    try {
      const data = await authService.login(values)
      setAuth(data.token, data.user)
      toast.success(`¡Bienvenido, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      const errorMsg = error.response?.data?.error
      
      if (errorMsg) {
        if (errorMsg.toLowerCase().includes('contraseña') || errorMsg.toLowerCase().includes('clave')) {
          setErrors({ password: errorMsg })
        } else if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('cuenta')) {
          setErrors({ email: errorMsg })
        } else {
          toast.error(errorMsg)
        }
      } else if (error.message === 'Network Error' || !error.response) {
        toast.error('No se pudo conectar con el servidor. Verifique su conexión.')
      } else {
        toast.error('Ocurrió un error inesperado al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - Jugador visible a la izquierda */}
      <div 
        className="absolute inset-0 bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: 'url(/login_hero.webp)' }}
      >
        {/* Gradient Overlay - oscurece más hacia la derecha para el formulario */}
        <div className="absolute inset-0 bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-gray-900/40"></div>
      </div>

      {/* Subtle animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver al inicio</span>
          </button>
        </header>

        {/* Main Content - Formulario a la derecha */}
        <main className="flex-1 flex items-center justify-end px-6 sm:px-8 lg:px-16 xl:px-24">
          {/* Login Card */}
          <div className="w-full max-w-md animate-fade-in-up">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FiActivity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Kallpa UNL</h1>
                <p className="text-sm text-white/40">Módulo de Baloncesto</p>
              </div>
            </div>

            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-white/50">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-400' : 'text-white/30 group-focus-within:text-blue-400'}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                      errors.email 
                        ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-white/10 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-white/20'
                    } text-white placeholder-white/25`}
                    placeholder="correo@ejemplo.com"
                    required
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-shake">
                    <FiAlertCircle className="flex-shrink-0 w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-400' : 'text-white/30 group-focus-within:text-blue-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                      errors.password 
                        ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-white/10 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-white/20'
                    } text-white placeholder-white/25`}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-shake">
                    <FiAlertCircle className="flex-shrink-0 w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] mt-2"
              >
                {/* Shimmer */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <span className="relative">Iniciar Sesión</span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-white/10">
              <p className="text-white/30 text-sm text-center">
                © 2026 Universidad Nacional de Loja
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
        
        .animation-delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  )
}

export default LoginPage
