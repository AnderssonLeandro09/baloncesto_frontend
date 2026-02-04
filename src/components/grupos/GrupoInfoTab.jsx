/**
 * Tab de información básica del grupo
 * Validaciones sincronizadas con el backend (serializar/grupo_atleta.py)
 */

import Input from './InputGrupoAtleta'
import { GRUPO_ATLETA_CONSTRAINTS } from '../../utils/grupoAtletaValidators'

export const GrupoInfoTab = ({ register, errors, minEdad, maxEdad, serverErrors }) => {
  // Combinar errores del formulario con errores del servidor
  const getFieldError = (fieldName) => {
    return errors[fieldName]?.message || serverErrors?.[fieldName]?.[0] || serverErrors?.[fieldName]
  }

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
              minLength: { 
                value: GRUPO_ATLETA_CONSTRAINTS.nombre.minLength, 
                message: `El nombre debe tener al menos ${GRUPO_ATLETA_CONSTRAINTS.nombre.minLength} caracteres` 
              },
              maxLength: { 
                value: GRUPO_ATLETA_CONSTRAINTS.nombre.maxLength, 
                message: `El nombre no puede exceder ${GRUPO_ATLETA_CONSTRAINTS.nombre.maxLength} caracteres` 
              },
              validate: (value) => {
                const trimmed = value?.trim()
                if (!trimmed) return 'El nombre no puede estar vacío'
                return true
              }
            })}
            error={getFieldError('nombre')}
            placeholder="Ej: Grupo Juvenil A"
            maxLength={GRUPO_ATLETA_CONSTRAINTS.nombre.maxLength}
          />
          <Input
            label="Categoría"
            {...register('categoria', { 
              required: 'La categoría es obligatoria',
              minLength: { 
                value: GRUPO_ATLETA_CONSTRAINTS.categoria.minLength, 
                message: `La categoría debe tener al menos ${GRUPO_ATLETA_CONSTRAINTS.categoria.minLength} caracteres` 
              },
              maxLength: { 
                value: GRUPO_ATLETA_CONSTRAINTS.categoria.maxLength, 
                message: `La categoría no puede exceder ${GRUPO_ATLETA_CONSTRAINTS.categoria.maxLength} caracteres` 
              },
              validate: (value) => {
                const trimmed = value?.trim()
                if (!trimmed) return 'La categoría no puede estar vacía'
                return true
              }
            })}
            error={getFieldError('categoria')}
            placeholder="Ej: Juvenil, Infantil, Senior"
            maxLength={GRUPO_ATLETA_CONSTRAINTS.categoria.maxLength}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Rango de Edad
        </h3>
        <p className="text-xs text-gray-500">
          Los atletas deben tener una edad dentro de este rango para poder ser asignados al grupo.
          El rango permitido es de {GRUPO_ATLETA_CONSTRAINTS.edad.min} a {GRUPO_ATLETA_CONSTRAINTS.edad.max} años.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Edad Mínima"
            type="number"
            {...register('rango_edad_minima', { 
              required: 'La edad mínima es obligatoria',
              min: { 
                value: GRUPO_ATLETA_CONSTRAINTS.edad.min, 
                message: `La edad mínima debe ser al menos ${GRUPO_ATLETA_CONSTRAINTS.edad.min} años` 
              },
              max: { 
                value: GRUPO_ATLETA_CONSTRAINTS.edad.max, 
                message: `La edad mínima no puede ser mayor a ${GRUPO_ATLETA_CONSTRAINTS.edad.max} años` 
              },
              valueAsNumber: true
            })}
            error={getFieldError('rango_edad_minima')}
            placeholder={`${GRUPO_ATLETA_CONSTRAINTS.edad.min}`}
            min={GRUPO_ATLETA_CONSTRAINTS.edad.min}
            max={GRUPO_ATLETA_CONSTRAINTS.edad.max}
          />
          <Input
            label="Edad Máxima"
            type="number"
            {...register('rango_edad_maxima', { 
              required: 'La edad máxima es obligatoria',
              min: { 
                value: GRUPO_ATLETA_CONSTRAINTS.edad.min, 
                message: `La edad máxima debe ser al menos ${GRUPO_ATLETA_CONSTRAINTS.edad.min} años` 
              },
              max: { 
                value: GRUPO_ATLETA_CONSTRAINTS.edad.max, 
                message: `La edad máxima no puede ser mayor a ${GRUPO_ATLETA_CONSTRAINTS.edad.max} años` 
              },
              valueAsNumber: true
            })}
            error={getFieldError('rango_edad_maxima')}
            placeholder={`${GRUPO_ATLETA_CONSTRAINTS.edad.max}`}
            min={GRUPO_ATLETA_CONSTRAINTS.edad.min}
            max={GRUPO_ATLETA_CONSTRAINTS.edad.max}
          />
        </div>
        {Number.isFinite(minEdad) && Number.isFinite(maxEdad) && minEdad > maxEdad && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              La edad mínima no puede ser mayor que la edad máxima
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
