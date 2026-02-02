/**
 * Componente de Tabs reutilizable
 * Soporta indicadores de error en las pestañas
 */

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-1" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              relative py-3 px-6 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? tab.hasError 
                  ? 'border-red-500 text-red-600'
                  : 'border-blue-600 text-blue-600'
                : tab.hasError
                  ? 'border-transparent text-red-500 hover:text-red-600 hover:border-red-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {/* Indicador de error */}
            {tab.hasError && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Tabs
