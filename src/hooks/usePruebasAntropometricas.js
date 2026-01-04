import { useEffect } from 'react';
import usePruebaAntropometricaStore from '../stores/pruebaAntropometricaStore';

export const usePruebasAntropometricas = (autoFetch = true) => {
  const store = usePruebaAntropometricaStore();

  useEffect(() => {
    if (autoFetch) {
      store.fetchPruebas();
    }
  }, [autoFetch, store.filtros.page, store.filtros.pageSize, store.filtros.atleta, store.filtros.estado]);

  return {
    pruebas: store.pruebas,
    loading: store.loading,
    error: store.error,
    filtros: store.filtros,
    totalItems: store.totalItems,
    setFiltros: store.setFiltros,
    fetchPruebas: store.fetchPruebas,
    createPrueba: store.createPrueba,
    updatePrueba: store.updatePrueba,
    toggleEstadoPrueba: store.toggleEstadoPrueba,
    getPruebasByAtleta: store.getPruebasByAtleta,
    shareReport: store.shareReport,
  };
};
