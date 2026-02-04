/**
 * Página 404 - No encontrado
 */

import { Link } from 'react-router-dom'
import { Button } from '../components/common'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">
        Página no encontrada
      </h2>
      <p className="text-gray-500 mt-2 mb-6">
        Lo sentimos, la página que buscas no existe.
      </p>
      <Link to="/">
        <Button variant="primary">Volver al inicio</Button>
      </Link>
    </div>
  )
}

export default NotFoundPage
