/**
 * Cliente Axios configurado para conectar con el backend Django
 */

import axios from 'axios'
import { API_URL, API_TIMEOUT, DEFAULT_HEADERS } from '../config/api.config'

// Crear instancia de Axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
})

// Interceptor de request - agregar token si existe
apiClient.interceptors.request.use(
  (config) => {
    // Aquí se puede agregar el token de autenticación
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de response - manejo centralizado de errores
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejo de errores HTTP comunes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expirado o inválido
          localStorage.removeItem('token')
          localStorage.removeItem('auth-storage')
          window.location.href = '/login'
          break
        case 403:
          console.error('No tienes permisos para realizar esta acción')
          break
        case 404:
          console.error('Recurso no encontrado')
          break
        case 500:
          console.error('Error interno del servidor')
          break
        default:
          console.error('Error en la petición:', error.response.data)
      }
    } else if (error.request) {
      console.error('No se pudo conectar con el servidor')
    }
    return Promise.reject(error)
  }
)

export default apiClient
