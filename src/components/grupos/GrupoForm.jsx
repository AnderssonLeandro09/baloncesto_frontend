import { useForm } from 'react-hook-form'
import { FiSave, FiInfo, FiSearch, FiList } from 'react-icons/fi'
import { Button } from '../common'
import Tabs from './Tabs'
import { useGrupoForm } from '../../hooks'
import { GrupoInfoTab } from './GrupoInfoTab'
import { GrupoSearchTab } from './GrupoSearchTab'
import { GrupoSelectedTab } from './GrupoSelectedTab'

const GrupoForm = ({ grupo, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: grupo || {
      nombre: '',
      rango_edad_minima: '',
      rango_edad_maxima: '',
      categoria: '',
      estado: true,
      atletas: []
    }
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

  const tabs = [
    { id: 'info', label: 'Información del Grupo', icon: <FiInfo className="inline w-4 h-4" /> },
    { id: 'search', label: 'Buscar Atletas', icon: <FiSearch className="inline w-4 h-4" /> },
    { id: 'selected', label: `Seleccionados (${atletasSeleccionados.length})`, icon: <FiList className="inline w-4 h-4" /> }
  ]

  const handleFormSubmit = (data) => {
    // Validar y sanitizar datos antes de enviar al backend
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col" style={{ minHeight: '500px' }}>
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
            />
          )}
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
  )
}

export default GrupoForm
