import { useEffect, useCallback } from 'react';
import usePruebaAntropometricaStore from '../stores/pruebaAntropometricaStore';

export const usePruebasAntropometricas = (autoFetch = true) => {
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
    getPruebasByAtleta,
    shareReport,
  } = usePruebaAntropometricaStore();

  const memoizedFetchPruebas = useCallback(() => {
    if (autoFetch) {
      fetchPruebas();
    }
  }, [autoFetch, fetchPruebas]);

  useEffect(() => {
    memoizedFetchPruebas();
  }, [memoizedFetchPruebas, filtros.page, filtros.pageSize, filtros.atleta, filtros.estado]);

  return {
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
    getPruebasByAtleta,
    shareReport,
  };
};
