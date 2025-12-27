import { useNavigate, Navigate } from 'react-router-dom'
import { Button } from '../components/common'
import { useAuthStore } from '../stores'

const HomePage = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-primary-600 mb-8">Bienvenido a Basketball App</h1>
      <Button 
        variant="primary" 
        size="lg" 
        onClick={() => navigate('/login')}
      >
        Login
      </Button>
    </div>
  )
}

export default HomePage
