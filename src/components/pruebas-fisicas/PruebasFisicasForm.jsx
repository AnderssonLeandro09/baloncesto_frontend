import React, { useEffect, useState, useMemo } from 'react'
import { Select, Button } from '../common'
import { useForm } from '../../hooks'
import { PruebaFisicaService } from '../../api'
import toast from 'react-hot-toast'
import { FiSearch, FiUser, FiAlertCircle } from 'react-icons/fi'
import {
  TIPOS_PRUEBA,
  RANGOS_MAXIMOS,
  UNIDADES_POR_TIPO,
  LIMITES,
  sanitizeText,
  validarFormularioPruebaFisica,
  MENSAJES_ERROR,
} from '../../utils/validacionesPruebasFisicas'

const TIPO_PRUEBA_OPTIONS = [
  { value: TIPOS_PRUEBA.FUERZA, label: 'Fuerza (Salto Horizontal)' },
  { value: TIPOS_PRUEBA.VELOCIDAD, label: 'Velocidad' },
  { value: TIPOS_PRUEBA.AGILIDAD, label: 'Agilidad (ZIGZAG)' },
]

const PruebasFisicasForm = ({ initialData, onSubmit, onCancel, loading, serverErrors = {} }) => {
  const [atletas, setAtletas] = useState([])
  const [loadingAtletas, setLoadingAtletas] = useState(false)
  const [atletaSearch, setAtletaSearch] = useState('')
  const [selectedAtletaData, setSelectedAtletaData] = useState(null)
  const [showAtletasList, setShowAtletasList] = useState(false)
  const [resultadoAlerta, setResultadoAlerta] = useState(null)

  // Validación en tiempo real del campo resultado con alertas mejoradas
  const handleResultadoChange = (e) => {
    const value = e.target.value
    handleChange(e)
    
    if (value) {
      const resultado = parseFloat(value)
      const tipoActual = values.tipo_prueba
      const rangoMax = RANGOS_MAXIMOS[tipoActual] || 9999
      
      if (resultado <= 0) {
        setResultadoAlerta({
          tipo: 'error',
          mensaje: MENSAJES_ERROR.RESULTADO_NEGATIVO
        })
      } else if (resultado > rangoMax) {
        setResultadoAlerta({
          tipo: 'error',
          mensaje: MENSAJES_ERROR.RESULTADO_EXCEDE_RANGO(tipoActual, rangoMax)
        })
      } else {
        setResultadoAlerta(null)
      }
    } else {
      setResultadoAlerta(null)
    }
  }

  // Validación en tiempo real del campo observaciones (límite 200) - bloquea si excede
  const handleObservacionesChange = (e) => {
    const value = e.target.value
    
    // Bloquear si excede límite de caracteres
    if (value.length > LIMITES.MAX_OBSERVACIONES) {
      return // No actualiza el valor
    }
    
    handleChange(e)
  }

  const { values, errors, setErrors, handleChange, handleSubmit } = useForm(
    {
      atleta: initialData?.atleta || '',
      tipo_prueba: initialData?.tipo_prueba || TIPOS_PRUEBA.FUERZA,
      resultado: initialData?.resultado || '',
      observaciones: initialData?.observaciones || '',
      estado: initialData?.estado ?? true,
    },
    (vals) => {
      // Usar validaciones centralizadas
      const validationErrors = validarFormularioPruebaFisica(vals, !!initialData)
      
      // Mostrar toasts solo para errores que impiden el envío
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0]
        toast.error(firstError, {
          duration: 3000,
          position: 'top-right',
        })
      }
      
      return validationErrors
    }
  )

  // Sincronizar errores del servidor con el formulario
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...serverErrors }))
    }
  }, [serverErrors, setErrors])

  const handleFormSubmit = (vals) => {
    // Transformar los datos al formato que espera el backend
    const payload = {
      atleta_id: parseInt(vals.atleta),
      tipo_prueba: vals.tipo_prueba,
      resultado: parseFloat(vals.resultado),
      observaciones: sanitizeText(vals.observaciones || ''),
      estado: Boolean(vals.estado),
    }

    onSubmit(payload)
  }

  useEffect(() => {
    const fetchAtletas = async () => {
      setLoadingAtletas(true)
      try {
        const data = await PruebaFisicaService.getAtletasHabilitados()
        // Map athletes to options for Select component
        const options = (data || []).map(a => ({
          value: a.id,
          label: a.persona ? `${a.persona.nombre} ${a.persona.apellido} (${a.persona.identificacion})` : `Atleta ${a.id}`
        }))
        setAtletas(options)
        
        // Si hay initialData, buscar y seleccionar el atleta
        if (initialData?.atleta) {
          const atletaExistente = options.find(a => a.value === parseInt(initialData.atleta))
          if (atletaExistente) {
            setSelectedAtletaData(atletaExistente)
            setAtletaSearch(atletaExistente.label)
          }
        }
        
        if (options.length === 0) {
          toast('No hay atletas habilitados disponibles', {
            icon: 'ℹ️',
            duration: 4000,
            position: 'top-right',
          })
        }
      } catch (error) {
        console.error('Error fetching atletas:', error)
        toast.error(error.message || 'No se pudo cargar la lista de atletas', {
          duration: 4000,
          position: 'top-right',
        })
      } finally {
        setLoadingAtletas(false)
      }
    }

    fetchAtletas()
  }, [initialData?.atleta])

  // Filtrar atletas según búsqueda
  const atletasFiltrados = useMemo(() => {
    if (!atletaSearch.trim()) return atletas.slice(0, 10)
    const searchLower = atletaSearch.toLowerCase()
    return atletas.filter(a => 
      a.label.toLowerCase().includes(searchLower)
    ).slice(0, 10)
  }, [atletas, atletaSearch])

  // Manejar selección de atleta
  const handleSelectAtleta = (atleta) => {
    setSelectedAtletaData(atleta)
    setAtletaSearch(atleta.label)
    setShowAtletasList(false)
    // Actualizar el valor del form
    handleChange({ target: { name: 'atleta', value: atleta.value } })
  }

  // Limpiar selección de atleta
  const handleClearAtleta = () => {
    setSelectedAtletaData(null)
    setAtletaSearch('')
    handleChange({ target: { name: 'atleta', value: '' } })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>      
      {/* Buscador de Atletas */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Atleta</label>
        
        {selectedAtletaData && !initialData ? (
          // Atleta seleccionado
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800">{selectedAtletaData.label}</p>
            </div>
            <button
              type="button"
              onClick={handleClearAtleta}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
              disabled={loading}
            >
              Cambiar
            </button>
          </div>
        ) : initialData ? (
          // Modo edición - mostrar atleta sin opción de cambiar
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{selectedAtletaData?.label || 'Cargando...'}</p>
            </div>
          </div>
        ) : (
          // Buscador
          <div className="relative">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={atletaSearch}
                onChange={(e) => {
                  setAtletaSearch(e.target.value)
                  setShowAtletasList(true)
                }}
                onFocus={() => setShowAtletasList(true)}
                placeholder={loadingAtletas ? "Cargando atletas..." : "Buscar atleta por nombre o identificación..."}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingAtletas || loading}
              />
            </div>
            
            {/* Lista de resultados */}
            {showAtletasList && atletaSearch && atletasFiltrados.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {atletasFiltrados.map((atleta) => (
                  <button
                    key={atleta.value}
                    type="button"
                    onClick={() => handleSelectAtleta(atleta)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-gray-700">{atleta.label}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Sin resultados */}
            {showAtletasList && atletaSearch && atletasFiltrados.length === 0 && !loadingAtletas && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                No se encontraron atletas
              </div>
            )}
          </div>
        )}
        
        {errors.atleta && (
          <span className="text-xs text-red-500">{errors.atleta}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Tipo de Prueba"
          name="tipo_prueba"
          value={values.tipo_prueba}
          onChange={handleChange}
          options={TIPO_PRUEBA_OPTIONS}
          error={errors.tipo_prueba}
          disabled={loading}
        />

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Unidad de Medida</label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
            {UNIDADES_POR_TIPO[values.tipo_prueba] || 'N/A'}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-700">Resultado</label>
        <input
          name="resultado"
          type="number"
          step="0.01"
          value={values.resultado}
          onChange={handleResultadoChange}
          disabled={loading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.resultado ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder={`Ej: ${values.tipo_prueba === 'FUERZA' ? '250 (cm)' : '4.5 (seg)'}`}
        />
        {/* Indicador de rango permitido */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Mínimo: 0.01</span>
          <span>Máximo: {RANGOS_MAXIMOS[values.tipo_prueba] || 'N/A'} {values.tipo_prueba === 'FUERZA' ? 'cm' : 'seg'}</span>
        </div>
        {errors.resultado && (
          <div className="flex items-center gap-1 text-red-500 text-xs bg-red-50 px-2 py-1 rounded">
            <span></span>
            <span>{errors.resultado}</span>
          </div>
        )}
        {/* Alerta visual de validación en tiempo real */}
        {resultadoAlerta && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md mt-1 ${
            resultadoAlerta.tipo === 'error' 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            <span>{resultadoAlerta.mensaje}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Observaciones 
          <span className={`text-xs ml-2 ${(values.observaciones?.length || 0) > 180 ? 'text-amber-500 font-medium' : 'text-gray-500'}`}>
            ({values.observaciones?.length || 0}/200)
          </span>
        </label>
        <textarea
          name="observaciones"
          value={values.observaciones}
          onChange={handleObservacionesChange}
          disabled={loading}
          maxLength={200}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] disabled:bg-gray-100 disabled:cursor-not-allowed ${
            (values.observaciones?.length || 0) >= 200 ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Detalles adicionales de la prueba (máx. 200 caracteres)..."
        />
        {(values.observaciones?.length || 0) >= 180 && (
          <span className="text-xs text-amber-600">
            {200 - (values.observaciones?.length || 0)} caracteres restantes
          </span>
        )}
        {errors.observaciones && (
          <span className="text-xs text-red-500">{errors.observaciones}</span>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
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
          loading={loading}
        >
          {initialData ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

export default PruebasFisicasForm
