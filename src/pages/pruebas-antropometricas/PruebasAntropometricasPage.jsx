import React, { useState, useEffect } from 'react';
import { FiPlus, FiBarChart2, FiList, FiInfo } from 'react-icons/fi';
import { Card, Button, Select, Pagination, Modal } from '../../components/common';
import { usePruebasAntropometricas } from '../../hooks';
import { PruebaAntropometricaTable, PruebaAntropometricaModal, PruebaAntropometricaCharts } from '../../components/pruebas-antropometricas';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';

const PruebasAntropometricasPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingPrueba, setEditingPrueba] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [atletas, setAtletas] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewingPrueba, setViewingPrueba] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareEmail, setShareEmail] = useState('');

  const {
    pruebas,
    loading,
    error,
    filtros,
    totalItems,
    setFiltros,
    fetchPruebas,
    createPrueba,
    updatePrueba,
    toggleEstadoPrueba,
    shareReport,
  } = usePruebasAntropometricas();

  useEffect(() => {
    const fetchAtletas = async () => {
      try {
        const response = await apiClient.get('/inscripciones', {
          params: { estado: true }
        });
        const rawInscripciones = response.data?.data ?? response.data?.results ?? response.data ?? [];
        const inscripciones = Array.isArray(rawInscripciones) ? rawInscripciones : [];
        
        const atletasMap = new Map();
        inscripciones.forEach((inscripcion) => {
          if (inscripcion.atleta && inscripcion.atleta.id) {
            const atleta = inscripcion.atleta;
            if (!atletasMap.has(atleta.id)) {
              const nombre = atleta.nombres || atleta.persona?.first_name || '';
              const apellido = atleta.apellidos || atleta.persona?.last_name || '';
              atletasMap.set(atleta.id, {
                value: atleta.id,
                label: `${nombre} ${apellido}`.trim() || `Atleta ${atleta.id}`,
              });
            }
          }
        });
        
        setAtletas([{ value: 0, label: 'Todos los atletas' }, ...Array.from(atletasMap.values())]);
      } catch (error) {
        console.error('Error fetching atletas:', error);
        setAtletas([{ value: 0, label: 'Todos los atletas' }]);
      }
    };

    fetchAtletas();
  }, []);

  const handleCreate = () => {
    setEditingPrueba(null);
    setShowModal(true);
  };

  const handleEdit = (prueba) => {
    setEditingPrueba(prueba);
    setShowModal(true);
  };

  const handleView = (prueba) => {
    setViewingPrueba(prueba);
    setShowViewModal(true);
  };

  const handleToggleEstado = async (prueba) => {
    setToggleTarget(prueba);
    setShowToggleModal(true);
  };

  const confirmToggleEstado = async () => {
    if (!toggleTarget) return;
    try {
      setActionLoadingId(toggleTarget.id);
      await toggleEstadoPrueba(toggleTarget.id);
      toast.success('Estado actualizado correctamente');
      await fetchPruebas();
      setShowToggleModal(false);
      setToggleTarget(null);
    } catch (error) {
      const message = error?.response?.data?.error || error?.response?.data?.detail || 'Error al actualizar el estado de la prueba';
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingPrueba) {
        await updatePrueba(editingPrueba.id, data);
        toast.success('Prueba antropométrica actualizada correctamente');
      } else {
        await createPrueba(data);
        toast.success('Prueba antropométrica registrada correctamente');
      }
      await fetchPruebas();
      setShowModal(false);
    } catch (error) {
      const message = error?.response?.data?.error || error?.response?.data?.detail || 'Error al guardar la prueba';
      toast.error(message);
      throw error;
    }
  };

  const handleShareReport = (prueba) => {
    setShareTarget(prueba);
    setShareEmail('');
    setShowShareModal(true);
  };

  const confirmShareReport = () => {
    toast.info('Esta funcionalidad de compartir por correo electrónico será implementada en futuras versiones');
    setShowShareModal(false);
    setShareEmail('');
  };

  const handlePrintReport = (prueba) => {
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    const atletaNombre = prueba.atleta?.nombres 
      ? `${prueba.atleta.nombres} ${prueba.atleta.apellidos || ''}`
      : prueba.atleta?.nombre_atleta 
        ? `${prueba.atleta.nombre_atleta} ${prueba.atleta.apellido_atleta || ''}`
        : 'N/A';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Antropométrico - ${atletaNombre}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; }
          .subtitle { color: #666; }
          .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .data-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          .data-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .data-value { font-size: 18px; font-weight: bold; }
          .observations { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Reporte de Prueba Antropométrica</div>
          <div class="subtitle">Sistema de Baloncesto</div>
        </div>
        
        <p><strong>Atleta:</strong> ${atletaNombre}</p>
        <p><strong>Fecha de Registro:</strong> ${new Date(prueba.fecha_registro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div class="data-grid">
          <div class="data-item">
            <div class="data-label">Peso</div>
            <div class="data-value">${parseFloat(prueba.peso).toFixed(2)} kg</div>
          </div>
          <div class="data-item">
            <div class="data-label">Estatura</div>
            <div class="data-value">${parseFloat(prueba.estatura).toFixed(2)} m</div>
          </div>
          <div class="data-item">
            <div class="data-label">Altura Sentado</div>
            <div class="data-value">${parseFloat(prueba.altura_sentado).toFixed(2)} m</div>
          </div>
          <div class="data-item">
            <div class="data-label">Envergadura</div>
            <div class="data-value">${parseFloat(prueba.envergadura).toFixed(2)} m</div>
          </div>
          <div class="data-item">
            <div class="data-label">IMC</div>
            <div class="data-value">${parseFloat(prueba.indice_masa_corporal || prueba.imc || 0).toFixed(2)}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Índice Córmico</div>
            <div class="data-value">${parseFloat(prueba.indice_cormico || 0).toFixed(2)}</div>
          </div>
        </div>
        
        ${prueba.observaciones ? `
        <div class="observations">
          <strong>Observaciones:</strong>
          <p>${prueba.observaciones}</p>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleAtletaFilter = (value) => {
    const atletaId = value === '0' ? undefined : parseInt(value);
    setFiltros({ atleta: atletaId, page: 1 });
  };

  const handleEstadoFilter = (value) => {
    const estado = value === '' ? undefined : value === 'true';
    setFiltros({ estado, page: 1 });
  };

  const handleFechaInicioFilter = (value) => {
    const fecha = value || undefined;
    
    if (fecha) {
      // Si hay fecha fin, validar que fecha inicio no sea posterior
      if (filtros.fecha_fin && new Date(fecha) > new Date(filtros.fecha_fin)) {
        toast.error('La fecha de inicio no puede ser posterior a la fecha fin');
        return;
      }
      
      // Validar rango máximo de 30 días si hay fecha fin
      if (filtros.fecha_fin) {
        const diffTime = Math.abs(new Date(filtros.fecha_fin) - new Date(fecha));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
          toast.error('El rango de fechas no puede ser mayor a 30 días');
          return;
        }
      }
      
      // Si no hay fecha fin, calcular y establecer fecha fin automática (30 días después o hoy)
      if (!filtros.fecha_fin) {
        const fechaInicio = new Date(fecha);
        const fechaMaxFin = new Date(fechaInicio);
        fechaMaxFin.setDate(fechaMaxFin.getDate() + 30);
        
        // No puede ser futura
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaFinCalculada = fechaMaxFin > hoy ? hoy : fechaMaxFin;
        
        setFiltros({ 
          fecha_inicio: fecha, 
          fecha_fin: fechaFinCalculada.toISOString().split('T')[0],
          page: 1 
        });
        return;
      }
    }
    
    setFiltros({ fecha_inicio: fecha, page: 1 });
  };

  const handleFechaFinFilter = (value) => {
    const fecha = value || undefined;
    
    if (fecha) {
      // Si hay fecha inicio, validar que fecha fin no sea anterior
      if (filtros.fecha_inicio && new Date(fecha) < new Date(filtros.fecha_inicio)) {
        toast.error('La fecha fin no puede ser anterior a la fecha de inicio');
        return;
      }
      
      // Validar rango máximo de 30 días
      if (filtros.fecha_inicio) {
        const diffTime = Math.abs(new Date(fecha) - new Date(filtros.fecha_inicio));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
          toast.error('El rango de fechas no puede ser mayor a 30 días');
          return;
        }
      }
    }
    
    setFiltros({ fecha_fin: fecha, page: 1 });
  };
  
  // Calcular límites de fecha
  const getFechaInicioMax = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return hoy;
  };
  
  const getFechaFinMin = () => {
    if (filtros.fecha_inicio) {
      return filtros.fecha_inicio;
    }
    return undefined;
  };
  
  const getFechaFinMax = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (filtros.fecha_inicio) {
      const fechaInicio = new Date(filtros.fecha_inicio);
      const fecha30Dias = new Date(fechaInicio);
      fecha30Dias.setDate(fecha30Dias.getDate() + 30);
      
      // Retornar el menor entre hoy y 30 días después
      const fechaMax = fecha30Dias > hoy ? hoy : fecha30Dias;
      return fechaMax.toISOString().split('T')[0];
    }
    
    return hoy.toISOString().split('T')[0];
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setFiltros({ pageSize: newPageSize, page: 1 });
  };

  // Función auxiliar para obtener nombre del atleta en el modal de detalles
  const getAtletaNombre = (prueba) => {
    if (!prueba?.atleta) return 'N/A';
    if (prueba.atleta.nombres) {
      return `${prueba.atleta.nombres} ${prueba.atleta.apellidos || ''}`.trim();
    }
    if (prueba.atleta.nombre_atleta) {
      return `${prueba.atleta.nombre_atleta} ${prueba.atleta.apellido_atleta || ''}`.trim();
    }
    if (typeof prueba.atleta === 'string') return prueba.atleta;
    return `Atleta #${prueba.atleta.id || 'N/A'}`;
  };

  // Clasificación del IMC
  const getIMCClassification = (imc) => {
    const value = parseFloat(imc);
    if (isNaN(value) || value === 0) return { text: '-', color: 'text-gray-500' };
    if (value < 18.5) return { text: 'Bajo peso', color: 'text-blue-600' };
    if (value < 25) return { text: 'Normal', color: 'text-green-600' };
    if (value < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' };
    return { text: 'Obesidad', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pruebas Antropométricas</h1>
          <p className="text-gray-500">Gestión de pruebas antropométricas de atletas</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('table')}
          >
            <FiList className="w-4 h-4 mr-2" />
            Tabla
          </Button>
          <Button
            variant={viewMode === 'charts' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('charts')}
          >
            <FiBarChart2 className="w-4 h-4 mr-2" />
            Gráficas
          </Button>
          <Button onClick={handleCreate}>
            <FiPlus className="w-4 h-4 mr-2" />
            Nueva Prueba
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Select
                  label="Filtrar por Atleta"
                  name="atletaFilter"
                  value={filtros.atleta?.toString() || '0'}
                  onChange={(e) => handleAtletaFilter(e.target.value)}
                  options={atletas}
                />
              </div>
              <div>
                <Select
                  label="Filtrar por Estado"
                  name="estadoFilter"
                  value={filtros.estado === undefined ? '' : filtros.estado.toString()}
                  onChange={(e) => handleEstadoFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Todos' },
                    { value: 'true', label: 'Activos' },
                    { value: 'false', label: 'Inactivos' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filtros.fecha_inicio || ''}
                  max={getFechaInicioMax()}
                  onChange={(e) => handleFechaInicioFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin (máx. 30 días)
                </label>
                <input
                  type="date"
                  value={filtros.fecha_fin || ''}
                  min={getFechaFinMin()}
                  max={getFechaFinMax()}
                  disabled={!filtros.fecha_inicio}
                  onChange={(e) => handleFechaFinFilter(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    !filtros.fecha_inicio ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>
            {filtros.fecha_inicio && (
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">💡 Consejo:</span> El rango seleccionado es de{' '}
                {filtros.fecha_inicio && filtros.fecha_fin ? (
                  <>
                    {Math.ceil((new Date(filtros.fecha_fin) - new Date(filtros.fecha_inicio)) / (1000 * 60 * 60 * 24))} días
                  </>
                ) : '30 días (máximo)'}
              </div>
            )}

            <PruebaAntropometricaTable
              data={pruebas}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onToggleEstado={handleToggleEstado}
              onShareReport={handleShareReport}
              onPrintReport={handlePrintReport}
              actionLoadingId={actionLoadingId}
            />

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Mostrando {pruebas.length > 0 ? ((filtros.page - 1) * (filtros.pageSize || 10)) + 1 : 0} - {Math.min((filtros.page || 1) * (filtros.pageSize || 10), totalItems || 0)} de {totalItems || 0} resultados
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Por página:
                  </label>
                  <select
                    value={filtros.pageSize?.toString() || '10'}
                    onChange={handlePageSizeChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
              <Pagination
                currentPage={filtros.page || 1}
                totalPages={Math.ceil(totalItems / filtros.pageSize) || 1}
                onPageChange={(page) => setFiltros({ page })}
                showPageSizeSelector={false}
              />
            </div>
          </Card>
        </>
      ) : (
        <PruebaAntropometricaCharts />
      )}

      <PruebaAntropometricaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        prueba={editingPrueba}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Modal de Detalles */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalles de Prueba Antropométrica"
        size="lg"
      >
        {viewingPrueba && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FiInfo className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{getAtletaNombre(viewingPrueba)}</h3>
                <p className="text-sm text-gray-500">
                  Registrado el {new Date(viewingPrueba.fecha_registro).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Peso</p>
                <p className="text-2xl font-bold text-blue-800">{parseFloat(viewingPrueba.peso).toFixed(2)} kg</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Estatura</p>
                <p className="text-2xl font-bold text-green-800">{parseFloat(viewingPrueba.estatura).toFixed(2)} m</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Altura Sentado</p>
                <p className="text-2xl font-bold text-yellow-800">{parseFloat(viewingPrueba.altura_sentado).toFixed(2)} m</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Envergadura</p>
                <p className="text-2xl font-bold text-orange-800">{parseFloat(viewingPrueba.envergadura).toFixed(2)} m</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">IMC</p>
                <p className="text-2xl font-bold text-purple-800">
                  {parseFloat(viewingPrueba.indice_masa_corporal || viewingPrueba.imc || 0).toFixed(2)}
                </p>
                <p className={`text-xs ${getIMCClassification(viewingPrueba.indice_masa_corporal || viewingPrueba.imc).color}`}>
                  {getIMCClassification(viewingPrueba.indice_masa_corporal || viewingPrueba.imc).text}
                </p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-sm text-pink-600 font-medium">Índice Córmico</p>
                <p className="text-2xl font-bold text-pink-800">
                  {parseFloat(viewingPrueba.indice_cormico || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {viewingPrueba.observaciones && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium mb-2">Observaciones</p>
                <p className="text-gray-800">{viewingPrueba.observaciones}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                Cerrar
              </Button>
              <Button onClick={() => handlePrintReport(viewingPrueba)}>
                Imprimir Reporte
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Activar/Desactivar */}
      <Modal
        isOpen={showToggleModal}
        onClose={() => {
          setShowToggleModal(false);
          setToggleTarget(null);
        }}
        title={toggleTarget?.estado ? 'Desactivar Prueba' : 'Activar Prueba'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {toggleTarget?.estado
              ? '¿Está seguro de desactivar esta prueba antropométrica?'
              : '¿Está seguro de activar esta prueba antropométrica?'}
          </p>

          {toggleTarget && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium text-gray-900">{getAtletaNombre(toggleTarget)}</p>
              <p>Fecha: {new Date(toggleTarget.fecha_registro).toLocaleDateString('es-ES')}</p>
              <p>Estado actual: {toggleTarget.estado ? 'Activo' : 'Inactivo'}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowToggleModal(false);
                setToggleTarget(null);
              }}
              disabled={actionLoadingId === toggleTarget?.id}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmToggleEstado}
              isLoading={actionLoadingId === toggleTarget?.id}
            >
              {toggleTarget?.estado ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Compartir por Correo */}
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setShareTarget(null);
          setShareEmail('');
        }}
        title="Compartir Reporte"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium">
              Esta funcionalidad de compartir por correo electrónico será implementada en futuras versiones
            </p>
          </div>

          {shareTarget && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium text-gray-900">{getAtletaNombre(shareTarget)}</p>
              <p>Fecha: {new Date(shareTarget.fecha_registro).toLocaleDateString('es-ES')}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowShareModal(false);
                setShareTarget(null);
                setShareEmail('');
              }}
            >
              Cerrar
            </Button>
            <Button
              onClick={confirmShareReport}
              disabled
            >
              Compartir por Correo (Próximamente)
            </Button>
          </div>
        </div>
      </Modal>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default PruebasAntropometricasPage;
