/**
 * Exportación centralizada de todos los stores
 * Usar: import { useAtletaStore, useUiStore } from '@/stores'
 */

export { default as useUiStore } from './uiStore'
export { default as useAtletaStore } from './atletaStore'
export { default as useEntrenadorStore } from './entrenadorStore'
export { default as useGrupoStore } from './grupoStore'
export { default as useInscripcionStore } from './inscripcionStore'
export { default as usePruebaAntropometricaStore } from './pruebaAntropometricaStore'
export { default as usePruebaFisicaStore } from './pruebaFisicaStore'
export { default as useEstudianteVinculacionStore } from './estudianteVinculacionStore'
