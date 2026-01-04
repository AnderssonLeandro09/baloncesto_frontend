import React, { useEffect, useState } from 'react'
import { Input, Select, Button } from '../common'
import { useForm } from '../../hooks'
import { PruebaFisicaService } from '../../api'
import toast from 'react-hot-toast'

const TIPO_PRUEBA_OPTIONS = [
  { value: 'FUERZA', label: 'Fuerza (Salto Horizontal)' },
  { value: 'VELOCIDAD', label: 'Velocidad' },
  { value: 'AGILIDAD', label: 'Agilidad (ZIGZAG)' },
]

// Mapeo de unidades por tipo (basado en pruebas de baloncesto)
const UNIDADES_POR_TIPO = {
  'FUERZA': 'Centímetros (cm)',  // Salto horizontal
  'VELOCIDAD': 'Segundos (seg)',  // 30 metros
  'AGILIDAD': 'Segundos (seg)'  // Zigzag
}

// Función para sanitizar texto y prevenir XSS
const sanitizeText = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/[<>"'&]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;'
      }
      return entities[char]
    })
    .trim()
    .substring(0, 1000) // Limitar longitud
}

// Función para calcular el semestre automáticamente desde una fecha
const calcularSemestre = (fecha = new Date()) => {
  const year = fecha.getFullYear()
  const month = fecha.getMonth() + 1 // getMonth() es 0-indexed
  const periodo = month <= 6 ? 1 : 2
  return `${year}-${periodo}`
}

const PruebasFisicasForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [atletas, setAtletas] = useState([])
  const [loadingAtletas, setLoadingAtletas] = useState(false)

  // Validación en tiempo real del campo resultado
  const handleResultadoChange = (e) => {
    const value = e.target.value
    handleChange(e)
    
    if (value) {
      const resultado = parseFloat(value)
      
      if (resultado < 0) {
        toast.error('No se permiten valores negativos', {
          duration: 2000,
          position: 'top-right',
        })
      } else if (resultado > 9999) {
        toast.error('Valor demasiado alto (máximo: 9,999)', {
          duration: 2000,
          position: 'top-right',
        })
      }
    }
  }

  // Validación en tiempo real del campo observaciones
  const handleObservacionesChange = (e) => {
    const value = e.target.value
    handleChange(e)
    
    if (value.length > 1000) {
      toast.error('Las observaciones exceden el límite de 1000 caracteres', {
        duration: 3000,
        position: 'top-right',
      })
    } else if (value.length > 900) {
      toast.warning(`Quedan ${1000 - value.length} caracteres disponibles`, {
        duration: 2000,
        position: 'top-right',
      })
    }
  }

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      atleta: initialData?.atleta || '',
      tipo_prueba: initialData?.tipo_prueba || 'FUERZA',
      resultado: initialData?.resultado || '',
      observaciones: initialData?.observaciones || '',
      estado: initialData?.estado ?? true,
    },
    (vals) => {
      const errs = {}
      
      // Validación de atleta
      if (!vals.atleta) {
        errs.atleta = 'Debe seleccionar un atleta'
        toast.error('Debe seleccionar un atleta', {
          duration: 3000,
          position: 'top-right',
        })
      }
      
      // Validación de tipo de prueba
      if (!vals.tipo_prueba) {
        errs.tipo_prueba = 'Debe seleccionar un tipo de prueba'
        toast.error('Debe seleccionar un tipo de prueba', {
          duration: 3000,
          position: 'top-right',
        })
      } else if (!['FUERZA', 'VELOCIDAD', 'AGILIDAD'].includes(vals.tipo_prueba)) {
        errs.tipo_prueba = 'Tipo de prueba no válido'
        toast.error('El tipo de prueba seleccionado no es válido', {
          duration: 3000,
          position: 'top-right',
        })
      }
      
      // Validaciones de resultado
      if (!vals.resultado) {
        errs.resultado = 'El resultado es requerido'
        toast.error('Debe ingresar el resultado de la prueba', {
          duration: 3000,
          position: 'top-right',
        })
      } else {
        const resultado = parseFloat(vals.resultado)
        
        if (isNaN(resultado)) {
          errs.resultado = 'El resultado debe ser un número válido'
          toast.error('El resultado debe ser un número válido', {
            duration: 3000,
            position: 'top-right',
          })
        } else if (resultado < 0) {
          errs.resultado = 'El resultado no puede ser negativo'
          toast.error('No se permiten valores negativos', {
            duration: 3000,
            position: 'top-right',
          })
        } else if (resultado === 0) {
          errs.resultado = 'El resultado debe ser mayor a 0'
          toast.error('El resultado debe ser mayor a cero', {
            duration: 3000,
            position: 'top-right',
          })
        } else if (resultado > 9999) {
          errs.resultado = 'El resultado excede el valor máximo permitido'
          toast.error('El resultado excede el valor máximo (9,999)', {
            duration: 3000,
            position: 'top-right',
          })
        } else if (vals.tipo_prueba === 'FUERZA' && resultado > 500) {
          toast.warning('Verifique el resultado: valores muy altos para salto horizontal', {
            duration: 4000,
            position: 'top-right',
          })
        } else if ((vals.tipo_prueba === 'VELOCIDAD' || vals.tipo_prueba === 'AGILIDAD') && resultado > 60) {
          toast.warning('Verifique el resultado: tiempo muy alto para esta prueba', {
            duration: 4000,
            position: 'top-right',
          })
        }
      }
      
      // Validar longitud de observaciones
      if (vals.observaciones && vals.observaciones.length > 1000) {
        errs.observaciones = 'Las observaciones no pueden exceder 1000 caracteres'
        toast.error('Las observaciones son demasiado largas (máximo 1000 caracteres)', {
          duration: 3000,
          position: 'top-right',
        })
      }
      
      return errs
    }
  )

  const handleFormSubmit = (vals) => {
    // Obtener fecha local en formato YYYY-MM-DD
    const today = new Date()
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    // Transformar los datos al formato que espera el backend
    const payload = {
      atleta_id: parseInt(vals.atleta),
      tipo_prueba: vals.tipo_prueba,
      resultado: parseFloat(vals.resultado),
      observaciones: sanitizeText(vals.observaciones || ''),
      estado: Boolean(vals.estado),
      fecha_registro: localDate
    }
    
    onSubmit(payload)
  }

  useEffect(() => {
    const fetchAtletas = async () => {
      setLoadingAtletas(true)
      try {
        const data = await PruebaFisicaService.getAtletasHabilitados()
        // Map athletes to options for Select component
        const options = data.map(a => ({
          value: a.id,
          label: a.persona ? `${a.persona.nombre} ${a.persona.apellido} (${a.persona.identificacion})` : `Atleta ${a.id}`
        }))
        setAtletas(options)
        
        if (options.length === 0) {
          toast.info('No hay atletas habilitados disponibles', {
            duration: 4000,
            position: 'top-right',
          })
        }
      } catch (error) {
        console.error('Error fetching atletas:', error)
        toast.error('Error al cargar la lista de atletas', {
          duration: 4000,
          position: 'top-right',
        })
      } finally {
        setLoadingAtletas(false)
      }
    }

    fetchAtletas()
  }, [])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">      
      <Select
        label="Atleta"
        name="atleta"
        value={values.atleta}
        onChange={handleChange}
        options={atletas}
        error={errors.atleta}
        disabled={loadingAtletas || !!initialData || loading}
        placeholder={loadingAtletas ? "Cargando atletas..." : "Seleccione un atleta"}
      />

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

      <Input
        label="Resultado"
        name="resultado"
        type="number"
        step="0.01"
        min="0"
        value={values.resultado}
        onChange={handleResultadoChange}
        error={errors.resultado}
        placeholder="Ej: 10.5"
        disabled={loading}
      />

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Observaciones 
          <span className="text-xs text-gray-500 ml-2">
            ({values.observaciones?.length || 0}/1000)
          </span>
        </label>
        <textarea
          name="observaciones"
          value={values.observaciones}
          onChange={handleObservacionesChange}
          disabled={loading}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Detalles adicionales de la prueba..."
        />
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
