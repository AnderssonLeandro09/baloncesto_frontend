import React, { useEffect, useState, useRef } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { usePruebaFisicaStore, useAuthStore } from '../../stores'
import { useModal } from '../../hooks'
import { Card, Button, Modal, ConfirmDialog } from '../../components/common'
import PruebasFisicasList from '../../components/pruebas-fisicas/PruebasFisicasList'
import PruebasFisicasForm from '../../components/pruebas-fisicas/PruebasFisicasForm'

const PruebasFisicasPage = () => {
  const { 
    pruebas, 
    loading, 
    fetchPruebas, 
    createPrueba, 
    updatePrueba, 
    deletePrueba,
    toggleEstado
  } = usePruebaFisicaStore()
  
  const { user } = useAuthStore()
  const isEstudiante = user?.role === 'ESTUDIANTE_VINCULACION'
  const isEntrenador = user?.role === 'ENTRENADOR'
  const canCreate = isEstudiante || isEntrenador

  const [selectedPrueba, setSelectedPrueba] = useState(null)
  const [pruebaToDelete, setPruebaToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [semestreFilter, setSemestreFilter] = useState('todos')
  const hasLoadedRef = useRef(false)
  
  const formModal = useModal()
  const deleteModal = useModal()

  useEffect(() => {
    const loadPruebas = async () => {
      try {
        await fetchPruebas()
        if (!hasLoadedRef.current) {
          toast.success('Datos cargados correctamente', {
            duration: 2000,
            position: 'top-right',
          })
          hasLoadedRef.current = true
        }
      } catch (error) {
        toast.error('Error al cargar las pruebas físicas', {
          duration: 4000,
          position: 'top-right',
        })
      }
    }
    loadPruebas()
  }, [fetchPruebas])

  const handleCreate = () => {
    if (!canCreate) {
      toast.error('No tiene permisos para crear pruebas físicas', {
        duration: 4000,
        position: 'top-right',
      })
      return
    }
    setSelectedPrueba(null)
    formModal.open()
  }

  const handleEdit = (prueba) => {
    if (!canCreate) {
      toast.error('No tiene permisos para editar pruebas físicas', {
        duration: 4000,
        position: 'top-right',
      })
      return
    }
    setSelectedPrueba(prueba)
    formModal.open()
  }

  const handleToggleClick = (prueba) => {
    if (!canCreate) {
      toast.error('No tiene permisos para modificar el estado de pruebas físicas', {
        duration: 4000,
        position: 'top-right',
      })
      return
    }
    setPruebaToDelete(prueba)
    deleteModal.open()
  }

  const handleFormSubmit = async (values) => {
    console.log('handleFormSubmit ejecutado con:', values)
    
    try {
      if (selectedPrueba) {
        // Al actualizar, solo enviar campos modificables
        // La unidad_medida se asigna automáticamente en el backend según tipo_prueba
        const updatePayload = {
          tipo_prueba: values.tipo_prueba,
          resultado: values.resultado,
          observaciones: values.observaciones || '',
          estado: values.estado
        }
        console.log('Actualizando con payload:', updatePayload)
        
        const result = await updatePrueba(selectedPrueba.id, updatePayload)
        console.log('Resultado de updatePrueba:', result)
        
        if (result.success) {
          toast.success('Prueba física actualizada exitosamente', {
            duration: 3000,
            position: 'top-right',
          })
          await fetchPruebas() // Refrescar la lista
          formModal.close()
        } else {
          toast.error(`${result.error || 'Error al actualizar la prueba'}`, {
            duration: 4000,
            position: 'top-right',
          })
        }
      } else {
        const result = await createPrueba(values)
        console.log('Resultado de createPrueba:', result)
        
        if (result.success) {
          toast.success('Prueba física creada exitosamente', {
            duration: 3000,
            position: 'top-right',
          })
          await fetchPruebas() // Refrescar la lista
          formModal.close()
        } else {
          toast.error(`${result.error || 'Error al crear la prueba'}`, {
            duration: 4000,
            position: 'top-right',
          })
        }
      }
    } catch (error) {
      console.error('Error al guardar prueba:', error)
      toast.error('Error inesperado al guardar la prueba física', {
        duration: 4000,
        position: 'top-right',
      })
    }
  }

  const confirmToggle = async () => {
    if (!pruebaToDelete) {
      toast.error('No se ha seleccionado ninguna prueba', {
        duration: 3000,
        position: 'top-right',
      })
      return
    }
    
    try {
      const result = await toggleEstado(pruebaToDelete.id)
      
      if (result.success) {
        if (pruebaToDelete.estado) {
          toast.success('Prueba física desactivada correctamente', {
            duration: 3000,
            position: 'top-right',
          })
        } else {
          toast.success('Prueba física activada correctamente', {
            duration: 3000,
            position: 'top-right',
          })
        }
        await fetchPruebas() // Refrescar la lista después del toggle
        deleteModal.close()
      } else {
        toast.error(`${result.error || 'Error al cambiar el estado'}`, {
          duration: 4000,
          position: 'top-right',
        })
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error inesperado al cambiar el estado de la prueba', {
        duration: 4000,
        position: 'top-right',
      })
    }
  }

  // Obtener lista única de semestres para el filtro (ANTES del filtrado)
  const semestresDisponibles = [...new Set(pruebas.map(p => p.semestre).filter(Boolean))].sort().reverse()

  const filteredPruebas = pruebas.filter(p => {
    // Filtro de búsqueda
    const search = searchTerm.toLowerCase()
    const nombreCompleto = `${p.persona?.nombre || ''} ${p.persona?.apellido || ''}`.toLowerCase()
    const identificacion = (p.persona?.identificacion || '').toLowerCase()
    const tipo = (p.tipo_prueba || '').toLowerCase()
    const semestre = (p.semestre || '').toLowerCase()
    
    const matchesSearch = nombreCompleto.includes(search) || 
           identificacion.includes(search) || 
           tipo.includes(search) ||
           semestre.includes(search)
    
    // Filtro de semestre
    const matchesSemestre = semestreFilter === 'todos' || p.semestre === semestreFilter
    
    return matchesSearch && matchesSemestre
  })

  // Mostrar mensaje informativo si no hay resultados
  useEffect(() => {
    if (searchTerm && filteredPruebas.length === 0 && pruebas.length > 0) {
      toast.info('No se encontraron resultados para la búsqueda', {
        duration: 2000,
        position: 'top-right',
      })
    }
  }, [filteredPruebas.length, searchTerm, pruebas.length])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pruebas Físicas</h1>
          <p className="text-gray-500">Gestión de pruebas de rendimiento físico</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={semestreFilter}
            onChange={(e) => setSemestreFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="todos">Todos los semestres</option>
            {semestresDisponibles.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar atleta o tipo..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canCreate && (
            <Button onClick={handleCreate}>
              <FiPlus className="w-4 h-4 mr-2" />
              Nueva Prueba
            </Button>
          )}
        </div>
      </div>

      <Card>
        <PruebasFisicasList 
          pruebas={filteredPruebas}
          loading={loading}
          onEdit={handleEdit}
          onToggleEstado={handleToggleClick}
        />
      </Card>

      {/* Modal de Formulario */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={selectedPrueba ? 'Editar Prueba Física' : 'Nueva Prueba Física'}
      >
        <PruebasFisicasForm
          initialData={selectedPrueba}
          onSubmit={handleFormSubmit}
          onCancel={formModal.close}
          loading={loading}
        />
      </Modal>

      {/* Diálogo de Confirmación para Eliminar */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={confirmToggle}
        title="Eliminar Prueba Física"
        message="¿Estás seguro de que deseas eliminar esta prueba física?"
        confirmText="Eliminar"
        variant="danger"
        loading={loading}
      />
    </div>
  )
}

export default PruebasFisicasPage
