import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from '../hooks'
import { authService } from '../api'
import { useAuthStore } from '../stores'
import { Button, Input, Card } from '../components/common'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const { values, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    (vals) => {
      const errors = {}
      if (!vals.email) errors.email = 'El email es requerido'
      if (!vals.password) errors.password = 'La contraseña es requerida'
      return errors
    }
  )

  const onLogin = async () => {
    setLoading(true)
    try {
      const data = await authService.login(values)
      setAuth(data.token, data.user)
      toast.success(`Bienvenido, ${data.user.name}`)
      navigate('/dashboard') // Redirigir al dashboard después del login
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">🏀 Basketball</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-6">
          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            required
          />

          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            placeholder="********"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={loading}
          >
            Iniciar Sesión
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
