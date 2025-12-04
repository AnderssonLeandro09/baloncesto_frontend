/**
 * Hook genérico para operaciones CRUD con API
 * Maneja estados de carga, error y datos
 */

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

const useApi = (apiService) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todos los registros
  const getAll = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getAll(params)
      setData(response)
      return response
    } catch (err) {
      setError(err.message || 'Error al obtener datos')
      toast.error('Error al obtener datos')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  // Obtener un registro por ID
  const getById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getById(id)
      return response
    } catch (err) {
      setError(err.message || 'Error al obtener el registro')
      toast.error('Error al obtener el registro')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  // Crear un nuevo registro
  const create = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.create(data)
      toast.success('Registro creado exitosamente')
      return response
    } catch (err) {
      setError(err.message || 'Error al crear el registro')
      toast.error('Error al crear el registro')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  // Actualizar un registro
  const update = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.update(id, data)
      toast.success('Registro actualizado exitosamente')
      return response
    } catch (err) {
      setError(err.message || 'Error al actualizar el registro')
      toast.error('Error al actualizar el registro')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  // Eliminar un registro
  const remove = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await apiService.delete(id)
      toast.success('Registro eliminado exitosamente')
    } catch (err) {
      setError(err.message || 'Error al eliminar el registro')
      toast.error('Error al eliminar el registro')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  return {
    data,
    loading,
    error,
    setData,
    getAll,
    getById,
    create,
    update,
    remove,
  }
}

export default useApi
