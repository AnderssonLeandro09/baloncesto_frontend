import { useEffect, useState } from 'react'
import { 
  FiPlus, FiSearch, FiRefreshCw, FiAlertCircle,
  FiUsers, FiTrendingUp, FiActivity
} from 'react-icons/fi'
import { Card, Button, Modal, Loading } from '../../components/common'
import { GrupoCard, GrupoForm, GrupoDetailModal } from '../../components/grupos'
import useGrupoStore from '../../stores/grupoStore'
import { toast } from 'react-hot-toast'
import { getFriendlyErrorMessage } from '../../utils/grupoAtletaValidators'

const GruposPage = () => {
  const {
    grupos,
    loading,
    error,
    fetchGrupos,
    createGrupo,
    updateGrupo,
    toggleEstado,
    setGrupoSeleccionado,
    grupoSeleccionado,
    clearGrupoSeleccionado,
    clearErrors,
  } = useGrupoStore()

  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [serverErrors, setServerErrors] = useState(null)

  useEffect(() => {
    fetchGrupos()
  }, [fetchGrupos])

  useEffect(() => {
    if (error && !showModal) {
      // Solo mostrar toast si no estamos en el modal (donde se muestran los errores inline)
      toast.error(getFriendlyErrorMessage(error))
    }
  }, [error, showModal])

  const handleCreate = () => {
    clearGrupoSeleccionado()
    clearErrors()
    setServerErrors(null)
    setShowModal(true)
  }

  const handleEdit = (grupo) => {
    setGrupoSeleccionado(grupo)
    clearErrors()
    setServerErrors(null)
    setShowModal(true)
  }

  const handleView = (grupo) => {
    setGrupoSeleccionado(grupo)
    setShowDetailModal(true)
  }

<<<<<<< Updated upstream
  const handleDelete = (grupo) => {
    setGrupoToDelete(grupo)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (grupoToDelete) {
      const result = await deleteGrupo(grupoToDelete.id)
      if (result.success) {
        toast.success(result.message || '¡Listo! El grupo ha sido eliminado')
        setShowDeleteDialog(false)
        setGrupoToDelete(null)
      } else {
        toast.error(getFriendlyErrorMessage(result.message))
      }
=======
  const handleToggleStatus = async (grupo) => {
    const result = await toggleEstado(grupo.id)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
>>>>>>> Stashed changes
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    clearGrupoSeleccionado()
    clearErrors()
    setServerErrors(null)
  }

  const handleSubmit = async (data) => {
    setServerErrors(null)
    let result
    
    if (grupoSeleccionado) {
      result = await updateGrupo(grupoSeleccionado.id, data)
      if (result.success) {
        toast.success(result.message || '¡Excelente! El grupo ha sido actualizado')
        handleCloseModal()
        fetchGrupos()
      } else {
        // Mostrar errores de validación en el formulario
        if (result.errors) {
          setServerErrors(result.errors)
        }
        // Mostrar toast con mensaje amigable
        toast.error(getFriendlyErrorMessage(result.message))
      }
    } else {
      result = await createGrupo(data)
      if (result.success) {
        toast.success(result.message || '¡Excelente! El grupo ha sido creado')
        handleCloseModal()
        fetchGrupos()
      } else {
        // Mostrar errores de validación en el formulario
        if (result.errors) {
          setServerErrors(result.errors)
        }
        // Mostrar toast con mensaje amigable
        toast.error(getFriendlyErrorMessage(result.message))
      }
    }
  }

  // Filtrado de grupos
  const filteredGrupos = grupos.filter(grupo => {
    // Sanitizar el término de búsqueda
    const sanitizedSearch = String(searchTerm || '').toLowerCase().substring(0, 100)
    const matchesSearch = String(grupo.nombre || '').toLowerCase().includes(sanitizedSearch) ||
                         String(grupo.categoria || '').toLowerCase().includes(sanitizedSearch)
    return matchesSearch
  })

  // Estadísticas
  const totalGrupos = grupos.length
  const gruposActivos = grupos.filter(g => g.estado).length
  const totalAtletas = grupos.reduce((sum, g) => sum + (g.atletas?.filter(a => a?.inscripcion?.habilitada)?.length || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grupos de Atletas</h1>
          <p className="text-gray-500 mt-1">Gestión y organización de grupos de entrenamiento</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => fetchGrupos()}
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleCreate}>
            <FiPlus className="w-4 h-4 mr-2" />
            Nuevo Grupo
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Grupos</p>
                <p className="text-3xl font-bold mt-1">{totalGrupos}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiUsers className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Grupos Activos</p>
                <p className="text-3xl font-bold mt-1">{gruposActivos}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiActivity className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Atletas</p>
                <p className="text-3xl font-bold mt-1">{totalAtletas}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiTrendingUp className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxLength={100}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Lista de Grupos */}
      {loading && !grupos.length ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : filteredGrupos.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay grupos registrados'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Intenta ajustar el término de búsqueda' 
                : 'Comienza creando tu primer grupo de atletas'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreate}>
                <FiPlus className="w-4 h-4 mr-2" />
                Crear Primer Grupo
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGrupos.map((grupo) => (
            <GrupoCard
              key={grupo.id}
              grupo={grupo}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modal de Formulario */}
      <Modal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        className="bg-blue-500"
        title={grupoSeleccionado ? 'Editar Grupo' : 'Nuevo Grupo de Atletas'}
        size="xl"
      >
        <GrupoForm
          grupo={grupoSeleccionado}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={loading}
          serverErrors={serverErrors}
        />
      </Modal>

      {/* Modal de Detalle */}
      {showDetailModal && (
        <GrupoDetailModal
          grupo={grupoSeleccionado}
          onClose={() => {
            setShowDetailModal(false)
            clearGrupoSeleccionado()
          }}
        />
      )}
    </div>
  )
}

export default GruposPage
