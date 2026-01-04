import React, { useState } from 'react';
import { FiPlus, FiBarChart2 } from 'react-icons/fi';
import { Card, Button, Select, Pagination } from '../../components/common';
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

  React.useEffect(() => {
    const fetchAtletas = async () => {
      try {
        const response = await apiClient.get('/inscripciones', {
          params: { estado: true }
        });
        const inscripciones = response.data?.results || response.data || [];
        
        const atletasMap = new Map();
        inscripciones.forEach((inscripcion) => {
          if (inscripcion.atleta && inscripcion.atleta.id) {
            const atleta = inscripcion.atleta;
            if (!atletasMap.has(atleta.id)) {
              atletasMap.set(atleta.id, {
                value: atleta.id,
                label: `${atleta.persona?.first_name || ''} ${atleta.persona?.last_name || ''}`.trim() || `Atleta ${atleta.id}`,
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
    console.log('Viewing prueba:', prueba);
  };

  const handleToggleEstado = async (prueba) => {
    const confirmMessage = prueba.estado
      ? '¿Está seguro de desactivar esta prueba?'
      : '¿Está seguro de activar esta prueba?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoadingId(prueba.id);
      await toggleEstadoPrueba(prueba.id);
      toast.success('Estado actualizado correctamente');
      await fetchPruebas();
    } catch (error) {
      const message = error?.response?.data?.detail || 'Error al actualizar el estado de la prueba';
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
      const message = error?.response?.data?.detail || 'Error al guardar la prueba';
      toast.error(message);
      throw error;
    }
  };

  const handleShareReport = async (prueba) => {
    const email = window.prompt('Correo electrónico de destino');
    if (!email) return;
    try {
      setActionLoadingId(prueba.id);
      await shareReport(prueba.id, { email });
      toast.success('Reporte enviado correctamente');
    } catch (error) {
      const message = error?.response?.data?.detail || 'Error al enviar el reporte';
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAtletaFilter = (value) => {
    const atletaId = value === '0' ? undefined : parseInt(value);
    setFiltros({ atleta: atletaId, page: 1 });
  };

  const handleEstadoFilter = (value) => {
    const estado = value === '' ? undefined : value === 'true';
    setFiltros({ estado, page: 1 });
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
            <FiBarChart2 className="w-4 h-4 mr-2" />
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
            <div className="flex flex-wrap gap-4 mb-4">
              <Select
                label="Filtrar por Atleta"
                name="atletaFilter"
                value={filtros.atleta?.toString() || '0'}
                onChange={(e) => handleAtletaFilter(e.target.value)}
                options={atletas}
                className="w-64"
              />
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
                className="w-48"
              />
            </div>

            <PruebaAntropometricaTable
              data={pruebas}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onToggleEstado={handleToggleEstado}
              onShareReport={handleShareReport}
              actionLoadingId={actionLoadingId}
            />

            <div className="mt-4">
              <Pagination
                currentPage={filtros.page || 1}
                totalPages={Math.ceil(totalItems / (filtros.page_size || 10))}
                onPageChange={(page) => setFiltros({ page })}
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default PruebasAntropometricasPage;
