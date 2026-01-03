import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi'
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

  const { values, errors, handleChange } = useForm(
    { email: '', password: '' },
    (vals) => {
      const errors = {}
      if (!vals.email) errors.email = 'El email es requerido'
      if (!vals.password) errors.password = 'La contraseña es requerida'
      return errors
    }
  )

  const onLogin = async (e) => {
    e.preventDefault()
    
    // Validar antes de enviar
    if (!values.email || !values.password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      const data = await authService.login(values)
      setAuth(data.token, data.user)
      toast.success(`¡Bienvenido, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Panel Izquierdo - Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo y Título */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kallpa UNL</h1>
                <p className="text-sm text-gray-500">Módulo de Baloncesto</p>
              </div>
            </div>
          </div>

          {/* Mensaje de Bienvenida */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={onLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="jugador@example.com"
                  required
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Panel Derecho - Hero/Imagen */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-black items-center justify-center p-12 overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-white max-w-lg">
          {/* Icono de baloncesto decorativo */}
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
              <span className="text-6xl">🏀</span>
            </div>
          </div>

          {/* Testimonio */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-2xl">★</span>
                ))}
              </div>
            </div>
            
            <blockquote className="text-3xl font-bold mb-6 leading-tight">
              "Potencia el rendimiento deportivo con datos precisos"
            </blockquote>
          </div>

          {/* Footer del panel */}
          <div className="mt-12 text-center text-sm text-gray-400">
            <p>Universidad Nacional de Loja</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
