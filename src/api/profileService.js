import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const profileService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.PROFILE}/me/`)
      return response.data
    } catch (error) {
      console.error('Error en getProfile:', error)
      throw error
    }
  },
}

export default profileService

