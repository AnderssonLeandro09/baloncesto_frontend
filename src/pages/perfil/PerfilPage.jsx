import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useProfileStore from '../../stores/profileStore'
import { Card, Loading } from '../../components/common'
import Input from '../../components/perfil/Input'
import { 
  FiArrowLeft, FiUser, FiBriefcase, FiAward, 
  FiHome, FiUserCheck, FiLayers, FiClipboard, 
  FiActivity, FiTarget, FiBookOpen 
} from 'react-icons/fi'

const PerfilPage = () => {
  const { profile, loading, fetchProfile } = useProfileStore()
  const navigate = useNavigate()

  // Mapeo de roles a claves de datos
  const ROLE_KEYS = {
    ADMIN: 'administrador',
    ENTRENADOR: 'entrenador',
    ESTUDIANTE_VINCULACION: 'estudiante'
  }

  // Items del menú para la sección de funcionalidades (copiado de Sidebar)
  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Inicio', roles: ['ADMIN', 'ENTRENADOR', 'ESTUDIANTE_VINCULACION'] },
    { path: '/dashboard/entrenadores', icon: FiUserCheck, label: 'Entrenadores', roles: ['ADMIN'] },
    { path: '/dashboard/grupos', icon: FiLayers, label: 'Grupos', roles: ['ENTRENADOR'] },
    { path: '/dashboard/inscripciones', icon: FiClipboard, label: 'Inscripciones', roles: ['ADMIN', 'ENTRENADOR'] },
    { path: '/dashboard/pruebas-antropometricas', icon: FiActivity, label: 'Pruebas Antropométricas', roles: ['ENTRENADOR', 'ESTUDIANTE_VINCULACION'] },
    { path: '/dashboard/pruebas-fisicas', icon: FiTarget, label: 'Pruebas Físicas', roles: ['ENTRENADOR', 'ESTUDIANTE_VINCULACION'] },
    { path: '/dashboard/estudiantes-vinculacion', icon: FiBookOpen, label: 'Est. Vinculación', roles: ['ADMIN'] },
  ]

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (loading && !profile) return <Loading />

  if (!profile) return <div>No se pudo cargar el perfil</div>

  // Preparar datos para visualización
  const roleKey = ROLE_KEYS[profile.role] || profile.role.toLowerCase()
  const displayData = {
    ...profile.data.persona,
    ...profile.data[roleKey],
    first_name: profile.data.persona.first_name || profile.data.persona.firts_name
  }

  const roleLabel = {
    ADMIN: 'Administrador',
    ENTRENADOR: 'Entrenador',
    ESTUDIANTE_VINCULACION: 'Estudiante de Vinculación'
  }[profile.role] || profile.role

  const filteredMenu = menuItems.filter((item) => item.roles.includes(profile.role))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header con boton de regresar */}
      <div className="mb-2">
        <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-4 py-2 text-gray-600 bg-white rounded-lg shadow-sm hover:bg-gray-50 hover:text-primary-600 transition-all"
        >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Regresar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Resumen del perfil */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-center -mt-16 mb-4">
                        <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg">
                            <div className="h-full w-full rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-5xl font-bold">
                                {profile.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                        <p className="text-sm text-gray-500 mb-4">{profile.email}</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                            {roleLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Resumen de funcionalidades */}
             <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Funcionalidades</h3>
                <div className="space-y-3">
                    {filteredMenu.filter(item => item.path !== '/dashboard').map((item) => (
                        <div
                            key={item.path}
                            className="flex items-center text-gray-600"
                        >
                            <item.icon className="w-5 h-5 mr-3 text-blue-500" />
                            <span className="text-sm">Gestión de {item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Columna derecha: Formulario detallado */}
        <div className="lg:col-span-2">
            <Card className="h-full border-gray-100 shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <FiUser className="w-5 h-5 mr-2 text-blue-500" />
                        Información Personal
                    </h3>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Nombres" value={displayData.first_name} disabled={true} />
                            <Input label="Apellidos" value={displayData.last_name} disabled={true} />
                            <Input label="Identificación" value={displayData.identification} disabled={true} className="bg-gray-50" />
                            <Input label="Teléfono" value={displayData.phono} disabled={true} />
                            <Input label="Dirección" value={displayData.direction} disabled={true} className="col-span-full" />
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                             <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                {profile.role === 'ADMIN' ? <FiAward className="w-5 h-5 mr-2 text-blue-500" /> : <FiBriefcase className="w-5 h-5 mr-2 text-blue-500" />}
                                Información del Rol ({roleLabel})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Role specific inputs */}
                                {profile.role === 'ENTRENADOR' && (
                                    <>
                                    <Input label="Especialidad" value={displayData.especialidad} disabled={true} />
                                    <Input label="Club Asignado" value={displayData.club_asignado} disabled={true} />
                                    </>
                                )}
                                {profile.role === 'ADMIN' && (
                                    <Input label="Cargo" value={displayData.cargo} disabled={true} />
                                )}
                                {profile.role === 'ESTUDIANTE_VINCULACION' && (
                                    <>
                                    <Input label="Carrera" value={displayData.carrera} disabled={true} />
                                    <Input label="Semestre" value={displayData.semestre} disabled={true} />
                                    </>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
      </div>
    </div>
  )
}

export default PerfilPage


