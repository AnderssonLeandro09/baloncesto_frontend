import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiX, FiSave, FiUsers, FiCheckCircle } from 'react-icons/fi'
import Input from './Input'
import { Button, Select } from '../common'
import { InscripcionService, GrupoAtletaService } from '../../api'

const GrupoForm = ({ grupo, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: grupo || {
      nombre: '',
      rango_edad_minima: '',
      rango_edad_maxima: '',
      categoria: '',
      estado: true,
      atletas: []
    }
  })

  const [atletasDisponibles, setAtletasDisponibles] = useState([])
  const [atletasElegibles, setAtletasElegibles] = useState([])
  const [atletasSeleccionados, setAtletasSeleccionados] = useState(grupo?.atletas?.map(a => a.id) || [])
  const [loadingAtletas, setLoadingAtletas] = useState(false)

  const minEdad = watch('rango_edad_minima')
  const maxEdad = watch('rango_edad_maxima')

  // Cargar todos los atletas disponibles (con inscripción habilitada)
  useEffect(() => {
    const fetchAtletas = async () => {
      try {
        const response = await InscripcionService.getAll()
        // Filtrar solo atletas con inscripción habilitada
        const atletasHabilitados = (response || [])
          .filter(inscripcion => inscripcion?.inscripcion?.habilitada)
          .map(item => ({
            id: item.atleta?.id,
            nombre: `${item.persona?.first_name || item.persona?.firts_name || ''} ${item.persona?.last_name || ''}`.trim(),
            identificacion: item.persona?.identification,
            edad: item.atleta?.edad,
          }))
          .filter(a => a.id && a.nombre)
        
        setAtletasDisponibles(atletasHabilitados)
      } catch (error) {
        console.error('Error al cargar atletas:', error)
      }
    }
    fetchAtletas()
  }, [])

  // Actualizar atletas elegibles cuando cambia el rango de edad
  useEffect(() => {
    if (minEdad && maxEdad && !isNaN(minEdad) && !isNaN(maxEdad)) {
      const min = parseInt(minEdad)
      const max = parseInt(maxEdad)
      
      if (min <= max) {
        const elegibles = atletasDisponibles.filter(
          atleta => atleta.edad >= min && atleta.edad <= max
        )
        setAtletasElegibles(elegibles)
      } else {
        setAtletasElegibles([])
      }
    } else {
      setAtletasElegibles([])
    }
  }, [minEdad, maxEdad, atletasDisponibles])

  const toggleAtleta = (atletaId) => {
    // Validar que el ID sea un número positivo válido
    const id = parseInt(atletaId)
    if (!id || id <= 0 || isNaN(id)) {
      console.error('ID de atleta inválido:', atletaId)
      return
    }
    
    setAtletasSeleccionados(prev => {
      // Limitar a un máximo de 100 atletas para prevenir DoS
      if (!prev.includes(id) && prev.length >= 100) {
        console.warn('Máximo 100 atletas por grupo')
        return prev
      }
      
      if (prev.includes(id)) {
        return prev.filter(prevId => prevId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleFormSubmit = (data) => {
    // Validar y sanitizar datos antes de enviar al backend
    
    // Validar que los datos existan
    if (!data || typeof data !== 'object') {
      console.error('Datos de formulario inválidos')
      return
    }
    
    // Validar y sanitizar nombre
    const nombre = String(data.nombre || '').trim()
    if (nombre.length < 3 || nombre.length > 100) {
      console.error('Nombre inválido')
      return
    }
    
    // Validar y sanitizar categoría
    const categoria = String(data.categoria || '').trim()
    if (categoria.length < 1 || categoria.length > 50) {
      console.error('Categoría inválida')
      return
    }
    
    // Validar edades
    const minEdad = parseInt(data.rango_edad_minima)
    const maxEdad = parseInt(data.rango_edad_maxima)
    
    if (isNaN(minEdad) || isNaN(maxEdad)) {
      console.error('Edades inválidas')
      return
    }
    
    if (minEdad < 0 || minEdad > 150 || maxEdad < 0 || maxEdad > 150) {
      console.error('Rango de edades fuera de límites')
      return
    }
    
    if (minEdad > maxEdad) {
      console.error('Edad mínima no puede ser mayor que la máxima')
      return
    }
    
    // Validar y sanitizar IDs de atletas
    const atletasValidos = atletasSeleccionados.filter(id => {
      const numId = parseInt(id)
      return !isNaN(numId) && numId > 0 && numId <= 999999999
    })
    
    if (atletasValidos.length > 100) {
      console.error('Demasiados atletas seleccionados')
      return
    }
    
    const submitData = {
      nombre: nombre,
      categoria: categoria,
      rango_edad_minima: minEdad,
      rango_edad_maxima: maxEdad,
      estado: Boolean(data.estado),
      atletas: atletasValidos
    }
    
    onSubmit(submitData)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <FiUsers className="w-6 h-6 text-white mr-3" />
          <h2 className="text-xl font-bold text-white">
            {grupo ? 'Editar Grupo' : 'Nuevo Grupo de Atletas'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body - Scrollable */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Grupo"
                {...register('nombre', { 
                  required: 'El nombre es obligatorio',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                })}
                error={errors.nombre?.message}
                placeholder="Ej: Grupo Juvenil A"
                maxLength={100}
              />
              <Input
                label="Categoría"
                {...register('categoria', { 
                  required: 'La categoría es obligatoria',
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                })}
                error={errors.categoria?.message}
                placeholder="Ej: Juvenil, Infantil, etc."
                maxLength={50}
              />
            </div>
          </div>

          {/* Rango de Edad */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Rango de Edad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Edad Mínima"
                type="number"
                {...register('rango_edad_minima', { 
                  required: 'La edad mínima es obligatoria',
                  min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                  max: { value: 150, message: 'Debe ser menor a 150' }
                })}
                error={errors.rango_edad_minima?.message}
                placeholder="0"
                min="0"
                max="150"
              />
              <Input
                label="Edad Máxima"
                type="number"
                {...register('rango_edad_maxima', { 
                  required: 'La edad máxima es obligatoria',
                  min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                  max: { value: 150, message: 'Debe ser menor a 150' }
                })}
                error={errors.rango_edad_maxima?.message}
                placeholder="0"
                min="0"
                max="150"
              />
            </div>
            {minEdad && maxEdad && parseInt(minEdad) > parseInt(maxEdad) && (
              <p className="text-sm text-red-600">
                La edad mínima no puede ser mayor que la edad máxima
              </p>
            )}
          </div>

          {/* ID del Entrenador - ELIMINADO: Se asigna automáticamente desde el backend */}

          {/* Selección de Atletas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Atletas del Grupo
              </h3>
              <span className="text-sm text-gray-500">
                {atletasSeleccionados.length} seleccionados
              </span>
            </div>

            {atletasElegibles.length > 0 ? (
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {atletasElegibles.map((atleta) => {
                  const isSelected = atletasSeleccionados.includes(atleta.id)
                  return (
                    <div
                      key={atleta.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleAtleta(atleta.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{atleta.nombre}</p>
                          <p className="text-sm text-gray-500">
                            {atleta.identificacion} • {atleta.edad} años
                          </p>
                        </div>
                        {isSelected && (
                          <FiCheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                {minEdad && maxEdad 
                  ? 'No hay atletas disponibles en este rango de edad' 
                  : 'Ingrese el rango de edad para ver atletas disponibles'}
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="estado"
              {...register('estado')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="estado" className="ml-2 text-sm text-gray-700">
              Grupo activo
            </label>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || (minEdad && maxEdad && parseInt(minEdad) > parseInt(maxEdad))}
          >
            <FiSave className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Grupo'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default GrupoForm
