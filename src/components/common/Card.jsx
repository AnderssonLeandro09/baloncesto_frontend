/**
 * Componente Card reutilizable
 */

const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  padding = true,
}) => {
  // Detectar si se requiere altura completa
  const needsFullHeight = className.includes('h-full') || className.includes('flex-1')
  
  return (
    <div className={`bg-white rounded-xl shadow-md ${needsFullHeight ? 'flex flex-col' : ''} ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className={`${padding ? 'p-6' : ''} ${needsFullHeight ? 'flex-1' : ''}`}>{children}</div>
    </div>
  )
}

export default Card
