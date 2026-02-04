import { useForm } from 'react-hook-form'
import { FiSave, FiInfo, FiSearch, FiList, FiAlertCircle } from 'react-icons/fi'
import { Button } from '../common'
import Tabs from './Tabs'
import { useGrupoForm } from '../../hooks'
import { GrupoInfoTab } from './GrupoInfoTab'
import { GrupoSearchTab } from './GrupoSearchTab'
import { GrupoSelectedTab } from './GrupoSelectedTab'
import { 
  validateGrupoAtleta, 
  GRUPO_ATLETA_CONSTRAINTS,
  getFriendlyErrorMessage
} from '../../utils/grupoAtletaValidators'

const GrupoForm = ({ grupo, onSubmit, onCancel, loading, serverErrors }) => {
  const { register, handleSubmit, formState: { errors, isSubmitted }, watch, setError, clearErrors } = useForm({
    defaultValues: grupo || {
      nombre: '',
      rango_edad_minima: '',
      rango_edad_maxima: '',
      categoria: '',
      estado: true,
      atletas: []
    },
    mode: 'onBlur', // Validar cuando el usuario sale del campo
    reValidateMode: 'onChange' // Re-validar en cada cambio después del primer submit
  })

  const minEdad = watch('rango_edad_minima')
  const maxEdad = watch('rango_edad_maxima')

  const {
    atletasFiltrados,
    atletasSeleccionados,
    atletasSeleccionadosInfo,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    toggleAtleta
  } = useGrupoForm(grupo, minEdad, maxEdad)

  // Verificar si hay errores en la pestaña de información
  const hasInfoErrors = Boolean(
    errors.nombre || errors.categoria || 
    errors.rango_edad_minima || errors.rango_edad_maxima ||
    serverErrors?.nombre || serverErrors?.categoria ||
    serverErrors?.rango_edad_minima || serverErrors?.rango_edad_maxima
  )

  // Verificar si hay errores en la pestaña de atletas seleccionados
  const hasAtletasErrors = Boolean(errors.atletas || serverErrors?.atletas)

  const tabs = [
    { 
      id: 'info', 
      label: 'Información del Grupo', 
      icon: <FiInfo className="inline w-4 h-4" />,
      hasError: hasInfoErrors
    },
    { 
      id: 'search', 
      label: 'Buscar Atletas', 
      icon: <FiSearch className="inline w-4 h-4" /> 
    },
    { 
      id: 'selected', 
      label: `Seleccionados (${atletasSeleccionados.length})`, 
      icon: <FiList className="inline w-4 h-4" />,
      hasError: hasAtletasErrors
    }
  ]

  const handleFormSubmit = (data) => {
    // Limpiar errores manuales previos
    clearErrors()
    
    // Validar y sanitizar datos antes de enviar al backend
    if (!data || typeof data !== 'object') {
      console.error('Datos de formulario inválidos')
      return
    }
    
    // Construir datos a validar
    const submitData = {
      nombre: String(data.nombre || '').trim(),
      categoria: String(data.categoria || '').trim(),
      rango_edad_minima: parseInt(data.rango_edad_minima, 10),
      rango_edad_maxima: parseInt(data.rango_edad_maxima, 10),
      atletas: atletasSeleccionados.filter(id => {
        const numId = parseInt(id, 10)
        return !isNaN(numId) && numId >= GRUPO_ATLETA_CONSTRAINTS.atletas.minId && numId <= GRUPO_ATLETA_CONSTRAINTS.atletas.maxId
      })
    }
    
    // Validar con las mismas reglas del backend
    const validation = validateGrupoAtleta(submitData)
    
    if (!validation.valid) {
      // Establecer errores en el formulario
      Object.entries(validation.errors).forEach(([field, message]) => {
        setError(field, { type: 'manual', message })
      })
      
      // Cambiar a la pestaña con errores
      if (validation.errors.nombre || validation.errors.categoria || 
          validation.errors.rango_edad_minima || validation.errors.rango_edad_maxima) {
        setActiveTab('info')
      } else if (validation.errors.atletas) {
        setActiveTab('selected')
      }
      return
    }
    
    // Validar cantidad máxima de atletas
    if (submitData.atletas.length > GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount) {
      setError('atletas', { 
        type: 'manual', 
        message: `No se pueden asignar más de ${GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount} atletas` 
      })
      setActiveTab('selected')
      return
    }
    
    onSubmit(submitData)
  }

  // Verificar si hay errores del servidor para mostrar alerta
  const hasServerErrors = serverErrors && Object.keys(serverErrors).length > 0

  // Verificar si hay errores de formulario
  const hasFormErrors = Object.keys(errors).length > 0

  // Determinar si el botón de guardar debe estar deshabilitado
  const isEdadInvalida = Number.isFinite(minEdad) && Number.isFinite(maxEdad) && minEdad > maxEdad

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col" style={{ minHeight: '500px' }}>
      {/* Alerta de errores del servidor */}
      {hasServerErrors && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Por favor, corrige los siguientes errores:
              </h4>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.entries(serverErrors).map(([field, messages]) => (
                  <li key={field}>
                    <span className="font-medium">
                      {field === 'nombre' ? 'Nombre' : 
                       field === 'categoria' ? 'Categoría' :
                       field === 'rango_edad_minima' ? 'Edad mínima' :
                       field === 'rango_edad_maxima' ? 'Edad máxima' :
                       field === 'atletas' ? 'Atletas' : field}:
                    </span>{' '}
                    {Array.isArray(messages) ? messages.join(', ') : getFriendlyErrorMessage(messages)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de errores de validación del formulario (después del primer submit) */}
      {isSubmitted && hasFormErrors && !hasServerErrors && (
        <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">
                Hay campos que requieren tu atención:
              </h4>
              <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <span className="font-medium">
                      {field === 'nombre' ? 'Nombre' : 
                       field === 'categoria' ? 'Categoría' :
                       field === 'rango_edad_minima' ? 'Edad mínima' :
                       field === 'rango_edad_maxima' ? 'Edad máxima' :
                       field === 'atletas' ? 'Atletas' : field}:
                    </span>{' '}
                    {error?.message || 'Campo inválido'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Form Body - Fixed Height */}
      <div className="p-6 overflow-y-auto" style={{ minHeight: '450px', maxHeight: '55vh' }}>
          {/* Tab 1: Información del Grupo */}
          {activeTab === 'info' && (
            <GrupoInfoTab 
              register={register} 
              errors={errors} 
              minEdad={minEdad} 
              maxEdad={maxEdad}
              serverErrors={serverErrors}
            />
          )}

          {/* Tab 2: Buscar Atletas */}
          {activeTab === 'search' && (
            <GrupoSearchTab
              atletasFiltrados={atletasFiltrados}
              atletasSeleccionados={atletasSeleccionados}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              toggleAtleta={toggleAtleta}
              minEdad={minEdad}
              maxEdad={maxEdad}
            />
          )}

          {/* Tab 3: Atletas Seleccionados */}
          {activeTab === 'selected' && (
            <GrupoSelectedTab
              atletasSeleccionadosInfo={atletasSeleccionadosInfo}
              toggleAtleta={toggleAtleta}
              error={errors.atletas?.message || serverErrors?.atletas}
            />
          )}
      </div>

      {/* Footer con acciones */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {atletasSeleccionados.length > 0 && (
              <span>
                {atletasSeleccionados.length} atleta{atletasSeleccionados.length !== 1 ? 's' : ''} seleccionado{atletasSeleccionados.length !== 1 ? 's' : ''}
                {atletasSeleccionados.length > GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount && (
                  <span className="text-red-500 ml-2">
                    (máximo {GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount})
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex gap-3">
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
              disabled={loading || isEdadInvalida || atletasSeleccionados.length > GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount}
            >
              <FiSave className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Grupo'}
            </Button>
          </div>
      </div>
    </form>
  )
}

export default GrupoForm
