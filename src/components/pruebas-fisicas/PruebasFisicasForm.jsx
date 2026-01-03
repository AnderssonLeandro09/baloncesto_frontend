import React, { useEffect, useState } from 'react'
import { Input, Select, Button } from '../common'
import { useForm } from '../../hooks'
import { PruebaFisicaService } from '../../api'

const TIPO_PRUEBA_OPTIONS = [
  { value: 'FUERZA', label: 'Fuerza' },
  { value: 'VELOCIDAD', label: 'Velocidad' },
  { value: 'AGILIDAD', label: 'Agilidad' },
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
      if (!vals.atleta) errs.atleta = 'El atleta es requerido'
      if (!vals.tipo_prueba) errs.tipo_prueba = 'El tipo de prueba es requerido'
      if (!vals.resultado) errs.resultado = 'El resultado es requerido'
      
      // Validaciones de rango
      const resultado = parseFloat(vals.resultado)
      if (isNaN(resultado)) {
        errs.resultado = 'El resultado debe ser un número válido'
      } else if (resultado <= 0) {
        errs.resultado = 'El resultado debe ser mayor a 0'
      } else if (resultado > 999999) {
        errs.resultado = 'El resultado excede el valor máximo permitido'
      }
      
      // Validar longitud de observaciones
      if (vals.observaciones && vals.observaciones.length > 1000) {
        errs.observaciones = 'Las observaciones no pueden exceder 1000 caracteres'
      }
      
      return errs
    }
  )

  const handleFormSubmit = (vals) => {
    // Obtener fecha local en formato YYYY-MM-DD
    const today = new Date()
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    // Validaciones de seguridad estrictas
    const atletaId = parseInt(vals.atleta)
    const resultado = parseFloat(vals.resultado)
    
    if (isNaN(atletaId) || atletaId <= 0 || atletaId > 2147483647) {
      console.error('ID de atleta inválido')
      return
    }
    if (isNaN(resultado) || resultado <= 0 || resultado > 999999) {
      console.error('Resultado inválido')
      return
    }
    if (!['FUERZA', 'VELOCIDAD', 'AGILIDAD'].includes(vals.tipo_prueba)) {
      console.error('Tipo de prueba inválido')
      return
    }
    
    // Transformar los datos al formato que espera el backend
    const payload = {
      atleta_id: atletaId,
      tipo_prueba: vals.tipo_prueba,
      resultado: resultado,
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
      } catch (error) {
        console.error('Error fetching atletas:', error)
      } finally {
        setLoadingAtletas(false)
      }
    }

    fetchAtletas()
  }, [])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Mostrar semestre - calculado o del registro existente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
        <span className="text-blue-700 font-medium">📅 Semestre:</span>
        <span className="text-blue-900 font-semibold">
          {initialData?.semestre || calcularSemestre()}
        </span>
        {!initialData && (
          <span className="text-xs text-blue-600 ml-2">(calculado automáticamente)</span>
        )}
      </div>
      
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
          <p className="text-xs text-gray-500 mt-1">Asignada automáticamente según el tipo de prueba</p>
        </div>
      </div>

      <Input
        label="Resultado"
        name="resultado"
        type="number"
        step="0.01"
        value={values.resultado}
        onChange={handleChange}
        error={errors.resultado}
        placeholder="Ej: 10.5"
        disabled={loading}
      />

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-700">Observaciones</label>
        <textarea
          name="observaciones"
          value={values.observaciones}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Detalles adicionales de la prueba..."
        />
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
