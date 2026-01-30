/**
 * Tab de información básica del grupo
 */

import Input from './GrupoInput'

export const GrupoInfoTab = ({ register, errors, minEdad, maxEdad }) => {
  return (
    <div className="space-y-6">
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
    </div>
  )
}
