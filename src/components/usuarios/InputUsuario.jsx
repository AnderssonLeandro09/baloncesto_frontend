/**
 * Componente Input especializado para formularios de usuarios
 * Compatible con react-hook-form (register) y uso tradicional (value/onChange)
 * Incluye validación y feedback visual mejorado
 */
import React from 'react'
import { FiAlertCircle } from 'react-icons/fi'

const InputUsuario = React.forwardRef(({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  className = '',
  helperText,
  ...props
}, ref) => {
  // Mostrar error si existe (sin requerir touched para compatibilidad con react-hook-form)
  const hasError = Boolean(error)

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
            ${hasError 
              ? 'border-red-500 focus:ring-red-500 pr-10' 
              : 'border-gray-300 focus:ring-primary-500'
            }
          `}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        />
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
      {helperText && !hasError && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

InputUsuario.displayName = 'InputUsuario'

export default InputUsuario
