/**
 * Página principal de Inscripciones
 * Gestión completa de inscripciones de atletas
 * 
 * Adaptado para el nuevo formato de respuesta del backend
 * con mensajes amigables para el usuario
 */

import { useEffect, useState } from 'react'
import { FiPlus, FiSearch, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { Card, Button, Modal, ConfirmDialog } from '../../components/common'
import { InscripcionList, InscripcionForm } from '../../components/inscripciones'
import useInscripcionStore from '../../stores/inscripcionStore'
import { MENSAJES_EXITO } from '../../utils/validacionesInscripcion'

const InscripcionesPage = () => {
  // Estado del store
  const {
    inscripciones,
    loading,
    error,
    fetchInscripciones,
    createInscripcion,
    updateInscripcion,
    toggleEstado,
    setInscripcionSeleccionada,
    inscripcionSeleccionada,
    clearInscripcionSeleccionada,
    clearErrors,
  } = useInscripcionStore()

  // Estado local de la página
  const [showModal, setShowModal] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [inscripcionToToggle, setInscripcionToToggle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Cargar inscripciones al montar
  useEffect(() => {
    fetchInscripciones()
  }, [fetchInscripciones])

  // Mostrar errores del store (solo si no estamos en el modal)
  useEffect(() => {
    if (error && !showModal) {
      toast.error(error)
    }
  }, [error, showModal])

  // Abrir modal para crear
  const handleCreate = () => {
    clearInscripcionSeleccionada()
    clearErrors()
    setFormErrors({})
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (inscripcion) => {
    setInscripcionSeleccionada(inscripcion)
    clearErrors()
    setFormErrors({})
    setShowModal(true)
  }

  // Ver detalles (por ahora abre edición)
  const handleView = (inscripcion) => {
    setInscripcionSeleccionada(inscripcion)
    setShowModal(true)
  }

  // Preparar toggle de estado
  const handleToggleStatus = (inscripcion) => {
    setInscripcionToToggle(inscripcion)
    setShowStatusDialog(true)
  }

  // Confirmar toggle de estado
  const confirmToggleStatus = async () => {
    if (!inscripcionToToggle) return

    const id = inscripcionToToggle.inscripcion?.id || inscripcionToToggle.id
    const result = await toggleEstado(id)

    if (result.success) {
      // Usar el mensaje amigable del store
      toast.success(result.mensaje)
      setShowStatusDialog(false)
      setInscripcionToToggle(null)
    } else {
      // Mostrar mensaje de error amigable
      toast.error(result.mensaje || 'No se pudo cambiar el estado de la inscripción')
    }
  }

  // Cerrar modal y limpiar errores
  const handleCloseModal = () => {
    setShowModal(false)
    clearInscripcionSeleccionada()
    clearErrors()
    setFormErrors({})
  }

  // Manejar submit del formulario
  const handleSubmit = async (data) => {
    setFormErrors({})
    let result

    if (inscripcionSeleccionada) {
      // Actualizar inscripción existente
      const id = inscripcionSeleccionada.inscripcion?.id || inscripcionSeleccionada.id
      result = await updateInscripcion(id, data)
      
      if (result.success) {
        toast.success(result.mensaje || MENSAJES_EXITO.ACTUALIZAR)
        handleCloseModal()
        fetchInscripciones()
      } else {
        // Si hay errores de campo, pasarlos al formulario
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setFormErrors(result.fieldErrors)
        }
        toast.error(result.mensaje || 'No se pudo actualizar la inscripción')
      }
    } else {
      // Crear nueva inscripción
      result = await createInscripcion(data)
      
      if (result.success) {
        toast.success(result.mensaje || MENSAJES_EXITO.CREAR)
        handleCloseModal()
        fetchInscripciones()
      } else {
        // Si hay errores de campo, pasarlos al formulario
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setFormErrors(result.fieldErrors)
        }
        toast.error(result.mensaje || 'No se pudo crear la inscripción')
      }
    }
  }

  // Filtrar inscripciones por búsqueda (con sanitización)
  const filteredInscripciones = (inscripciones || []).filter(item => {
    const persona = item.persona || {}
    // Sanitizar término de búsqueda para evitar problemas con caracteres especiales
    const search = searchTerm.toLowerCase().replace(/[<>\"'&]/g, '')
    
    if (!search) return true // Si no hay búsqueda, mostrar todos
    
    return (
      (persona.firts_name || persona.first_name || '').toLowerCase().includes(search) ||
      (persona.last_name || '').toLowerCase().includes(search) ||
      (persona.dni || '').toLowerCase().includes(search) ||
      (persona.identification || '').toLowerCase().includes(search)
    )
  })

  // Obtener nombre del atleta para el diálogo de confirmación
  const getAtletaNombre = () => {
    if (!inscripcionToToggle) return ''
    const persona = inscripcionToToggle.persona || {}
    const nombre = persona.firts_name || persona.first_name || ''
    const apellido = persona.last_name || ''
    return `${nombre} ${apellido}`.trim() || 'este atleta'
  }

  // Obtener estado actual de la inscripción a toggle
  const isHabilitada = inscripcionToToggle?.inscripcion?.habilitada ?? 
                       inscripcionToToggle?.habilitada ?? true

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inscripciones</h1>
          <p className="text-gray-500 mt-1">Gestión de inscripciones de atletas</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => fetchInscripciones()}
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleCreate}>
            <FiPlus className="w-4 h-4 mr-2" />
            Nueva Inscripción
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o identificación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </Card>

      {/* Lista de inscripciones */}
      <InscripcionList
        inscripciones={filteredInscripciones}
        onEdit={handleEdit}
        onView={handleView}
        onToggleStatus={handleToggleStatus}
        loading={loading}
      />

      {/* Modal de creación/edición */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={inscripcionSeleccionada ? 'Editar Inscripción' : 'Nueva Inscripción'}
        size="xl"
      >
        <InscripcionForm
          inscripcion={inscripcionSeleccionada}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={loading}
          serverErrors={formErrors}
        />
      </Modal>

      {/* Diálogo de confirmación para cambio de estado */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => {
          setShowStatusDialog(false)
          setInscripcionToToggle(null)
        }}
        onConfirm={confirmToggleStatus}
        title={isHabilitada ? 'Deshabilitar Inscripción' : 'Habilitar Inscripción'}
        message={`¿Estás seguro de que deseas ${isHabilitada ? 'deshabilitar' : 'habilitar'} la inscripción de ${getAtletaNombre()}?`}
        confirmText={isHabilitada ? 'Deshabilitar' : 'Habilitar'}
        confirmVariant={isHabilitada ? 'danger' : 'success'}
      />
    </div>
  )
}

export default InscripcionesPage
