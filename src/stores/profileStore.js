import { create } from 'zustand'
import profileService from '../api/profileService'

const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null })
    try {
      const data = await profileService.getProfile()
      set({ profile: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
}))

export default useProfileStore

