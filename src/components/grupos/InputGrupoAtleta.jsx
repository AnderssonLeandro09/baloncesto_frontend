/**
 * Componente Input reutilizable para formularios
 * Compatible con react-hook-form y formularios controlados
 */

import { forwardRef } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  helpText,
  ...props
}, ref) => {
  // Mostrar error si existe (con o sin touched)
  // Esto permite que funcione tanto con react-hook-form como con formularios controlados
  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : error?.message || error

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
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : helpText ? `${name}-help` : undefined}
          className={`
            w-full px-3 py-2 border rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-red-500 focus:ring-red-500 bg-red-50 pr-10' 
              : 'border-gray-300 focus:ring-blue-500'
            }
          `}
          {...props}
        />
        {/* Icono de error */}
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {/* Mensaje de error */}
      {hasError && errorMessage && (
        <div 
          id={`${name}-error`}
          className="mt-1.5 flex items-start gap-1.5 text-sm text-red-600"
          role="alert"
        >
          <FiAlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {/* Texto de ayuda (solo si no hay error) */}
      {!hasError && helpText && (
        <p id={`${name}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
