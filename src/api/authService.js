import apiClient from './apiClient'

const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login/', credentials)
    return response.data
  },
}

export default authService
