import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const profileService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.PROFILE}/me/`)
      // El backend ahora devuelve { msg, data, code, status }
      // Retornamos el campo 'data' que es el que espera el store
      if (response.data && response.data.status === 'success') {
        return response.data.data
      }
      return response.data
    } catch (error) {
      console.error('Error en getProfile:', error)
      throw error
    }
  },
}

export default profileService

