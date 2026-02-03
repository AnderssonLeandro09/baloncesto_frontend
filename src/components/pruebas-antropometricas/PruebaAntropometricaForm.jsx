import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Button } from '../common';
import apiClient from '../../api/apiClient';
import {
  VALIDACIONES_ANTROPOMETRICAS,
  MENSAJES_ERROR,
  toDecimal,
  getFechaMinima,
  getFechaMaxima,
} from '../../utils/validacionesAntropometricas';

// Constantes de validación importadas desde utilidades
const PESO_MIN = VALIDACIONES_ANTROPOMETRICAS.PESO.MIN;
const PESO_MAX = VALIDACIONES_ANTROPOMETRICAS.PESO.MAX;
const ESTATURA_MIN = VALIDACIONES_ANTROPOMETRICAS.ESTATURA.MIN;
const ESTATURA_MAX = VALIDACIONES_ANTROPOMETRICAS.ESTATURA.MAX;
const ALTURA_SENTADO_MIN = VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.MIN;
const ALTURA_SENTADO_MAX = VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.MAX;
const ALTURA_SENTADO_RATIO_MIN = VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.RATIO_MIN;
const ENVERGADURA_MIN = VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.MIN;
const ENVERGADURA_MAX = VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.MAX;
const ENVERGADURA_RATIO_MIN = VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.RATIO_MIN;
const ENVERGADURA_RATIO_MAX = VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.RATIO_MAX;
const FECHA_MAX_ANTIGUEDAD_ANOS = VALIDACIONES_ANTROPOMETRICAS.FECHA.MAX_ANTIGUEDAD_ANOS;

// Función para crear el schema dinámicamente según si es edición o creación
const createSchema = (isEditing = false) => {
  return yup.object({
    atleta: isEditing
      ? yup.number() // En edición solo validar que sea número, pero no es requerido cambiar
      : yup
          .number()
          .typeError(MENSAJES_ERROR.ATLETA.REQUERIDO)
          .transform((value, originalValue) => {
            return originalValue === '' || originalValue === null ? undefined : value;
          })
          .positive(MENSAJES_ERROR.ATLETA.REQUERIDO)
          .required(MENSAJES_ERROR.ATLETA.REQUERIDO),
    
    fecha_registro: isEditing
      ? yup.string() // En edición no validar cambios de fecha
      : yup
          .string()
          .required(MENSAJES_ERROR.FECHA.REQUERIDA)
          .test(
            'fecha-no-futura',
            MENSAJES_ERROR.FECHA.FUTURA,
            function (value) {
              if (!value) return true;
              const fecha = new Date(value);
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              return fecha <= hoy;
            }
          )
          .test(
            'fecha-no-antigua',
            MENSAJES_ERROR.FECHA.ANTIGUA(getFechaMinima()),
            function (value) {
              if (!value) return true;
              const fecha = new Date(value);
              const fechaMinima = new Date(getFechaMinima());
              return fecha >= fechaMinima;
            }
          ),
    
    peso: yup
      .number()
      .typeError(MENSAJES_ERROR.PESO.REQUERIDO)
      .transform(toDecimal)
      .required(MENSAJES_ERROR.PESO.REQUERIDO)
      .test('peso-positivo', MENSAJES_ERROR.PESO.POSITIVO, value => value > 0)
      .test('peso-minimo', MENSAJES_ERROR.PESO.MINIMO, value => value >= PESO_MIN)
      .test('peso-maximo', MENSAJES_ERROR.PESO.MAXIMO, value => value <= PESO_MAX),
    
    estatura: yup
      .number()
      .typeError(MENSAJES_ERROR.ESTATURA.REQUERIDO)
      .transform(toDecimal)
      .required(MENSAJES_ERROR.ESTATURA.REQUERIDO)
      .test('estatura-positiva', MENSAJES_ERROR.ESTATURA.POSITIVA, value => value > 0)
      .test('estatura-minima', MENSAJES_ERROR.ESTATURA.MINIMA, value => value >= ESTATURA_MIN)
      .test('estatura-maxima', MENSAJES_ERROR.ESTATURA.MAXIMA, value => value <= ESTATURA_MAX),
    
    altura_sentado: yup
      .number()
      .typeError(MENSAJES_ERROR.ALTURA_SENTADO.REQUERIDO)
      .transform(toDecimal)
      .required(MENSAJES_ERROR.ALTURA_SENTADO.REQUERIDO)
      .test('altura-sentado-positiva', MENSAJES_ERROR.ALTURA_SENTADO.POSITIVA, value => value > 0)
      .test('altura-sentado-minima', MENSAJES_ERROR.ALTURA_SENTADO.MINIMA, value => value >= ALTURA_SENTADO_MIN)
      .test('altura-sentado-maxima', MENSAJES_ERROR.ALTURA_SENTADO.MAXIMA, value => value <= ALTURA_SENTADO_MAX)
      .test(
        'altura-sentado-menor-estatura',
        MENSAJES_ERROR.ALTURA_SENTADO.MAYOR_ESTATURA,
        function (value) {
          const estatura = this.parent.estatura;
          if (typeof value !== 'number' || typeof estatura !== 'number') return true;
          return value <= estatura;
        }
      )
      .test(
        'altura-sentado-proporcion',
        MENSAJES_ERROR.ALTURA_SENTADO.PROPORCION,
        function (value) {
          const estatura = this.parent.estatura;
          if (typeof value !== 'number' || typeof estatura !== 'number') return true;
          return value >= estatura * ALTURA_SENTADO_RATIO_MIN;
        }
      ),
    
    envergadura: yup
      .number()
      .typeError(MENSAJES_ERROR.ENVERGADURA.REQUERIDO)
      .transform(toDecimal)
      .required(MENSAJES_ERROR.ENVERGADURA.REQUERIDO)
      .test('envergadura-positiva', MENSAJES_ERROR.ENVERGADURA.POSITIVA, value => value > 0)
      .test('envergadura-minima', MENSAJES_ERROR.ENVERGADURA.MINIMA, value => value >= ENVERGADURA_MIN)
      .test('envergadura-maxima', MENSAJES_ERROR.ENVERGADURA.MAXIMA, value => value <= ENVERGADURA_MAX)
      .test(
        'envergadura-ratio',
        function (value) {
          const estatura = this.parent.estatura;
          if (typeof value !== 'number' || typeof estatura !== 'number') return true;
          const ratio = value / estatura;
          if (ratio < ENVERGADURA_RATIO_MIN || ratio > ENVERGADURA_RATIO_MAX) {
            return this.createError({
              message: MENSAJES_ERROR.ENVERGADURA.RATIO(ratio)
            });
          }
          return true;
        }
      ),
    
    observaciones: yup.string().optional().nullable(),
  });
};

const PruebaAntropometricaForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [atletas, setAtletas] = useState([]);
  const [loadingAtletas, setLoadingAtletas] = useState(true);
  
  // Determinar si es edición
  const isEditing = !!initialData?.id;
  
  // Obtener el schema apropiado según si es creación o edición
  const schema = createSchema(isEditing);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      atleta: initialData?.atleta?.id || initialData?.atleta || '',
      fecha_registro:
        initialData?.fecha_registro || new Date().toISOString().split('T')[0],
      peso: initialData?.peso || '',
      estatura: initialData?.estatura || '',
      altura_sentado: initialData?.altura_sentado || '',
      envergadura: initialData?.envergadura || '',
      observaciones: initialData?.observaciones || '',
    },
  });

  const peso = watch('peso');
  const estatura = watch('estatura');
  const alturaSentado = watch('altura_sentado');

  // Calcular IMC automáticamente
  const imc =
    typeof peso === 'number' && typeof estatura === 'number' && estatura > 0
      ? (peso / (estatura * estatura)).toFixed(2)
      : '0.00';

  // Calcular Índice Córmico automáticamente (multiplicado por 100)
  const indiceCormico =
    typeof alturaSentado === 'number' && typeof estatura === 'number' && estatura > 0
      ? ((alturaSentado / estatura) * 100).toFixed(2)
      : '0.00';

  // Clasificación del IMC
  // Clasificación IMC (3 categorías: Insuficiente, Normal, Sobrepeso)
  const getIMCClassification = (imcValue) => {
    const value = parseFloat(imcValue);
    if (isNaN(value) || value === 0) return { text: '-', color: 'text-gray-700', bg: 'bg-gray-200' };
    if (value < 18.5) return { text: 'Insuficiente', color: 'text-blue-700', bg: 'bg-blue-100' };
    if (value < 25) return { text: 'Normal', color: 'text-green-700', bg: 'bg-green-100' };
    return { text: 'Sobrepeso', color: 'text-yellow-700', bg: 'bg-yellow-100' };
  };

  const imcClassification = getIMCClassification(imc);

  // Clasificación del Índice Córmico (Braquicórmico, Mesocórmico, Macrosquélico)
  const getCormicoClassification = (cormicoValue) => {
    const value = parseFloat(cormicoValue);
    if (isNaN(value) || value === 0) return { text: '-', color: 'text-gray-700', bg: 'bg-gray-200', detalle: '' };
    if (value < 50) return { text: 'Braquicórmico', color: 'text-blue-700', bg: 'bg-blue-100', detalle: '(tronco corto)' };
    if (value <= 55) return { text: 'Mesocórmico', color: 'text-green-700', bg: 'bg-green-100', detalle: '(tronco intermedio)' };
    return { text: 'Macrosquélico', color: 'text-yellow-700', bg: 'bg-yellow-100', detalle: '(tronco largo)' };
  };

  const cormicoClassification = getCormicoClassification(indiceCormico);

  // Observaciones automáticas: insertar categorías calculadas si el usuario no ha escrito nada
  const observacionesActuales = watch('observaciones');
  const [autoObs, setAutoObs] = useState('');

  useEffect(() => {
    const partes = [];
    if (imcClassification.text && imcClassification.text !== '-') {
      partes.push(`IMC: ${imcClassification.text}`);
    }
    if (cormicoClassification.text && cormicoClassification.text !== '-') {
      const detalle = cormicoClassification.detalle ? ` ${cormicoClassification.detalle}` : '';
      partes.push(`Índice córmico: ${cormicoClassification.text}${detalle}`);
    }
    const nuevaAutoObs = partes.join(' | ');
    setAutoObs(nuevaAutoObs);

    // Solo sobrescribir si el usuario no ha escrito o si coincide con la anterior sugerencia
    if (!observacionesActuales || observacionesActuales === '' || observacionesActuales === autoObs) {
      setValue('observaciones', nuevaAutoObs, { shouldValidate: false, shouldDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imcClassification.text, cormicoClassification.text, cormicoClassification.detalle]);

  useEffect(() => {
    const fetchAtletas = async () => {
      setLoadingAtletas(true);
      try {
        // Obtener atletas desde inscripciones activas
        const response = await apiClient.get('/inscripciones', {
          params: { estado: true }
        });
        const rawInscripciones = response.data?.data ?? response.data?.results ?? response.data ?? [];
        const inscripciones = Array.isArray(rawInscripciones) ? rawInscripciones : [];
        
        // Extraer atletas únicos de las inscripciones
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
        
        setAtletas(Array.from(atletasMap.values()));
      } catch (error) {
        console.error('Error fetching atletas:', error);
        // Si falla, intentar cargar desde grupos-atletas
        try {
          const response = await apiClient.get('/grupos-atletas');
          const rawGrupos = response.data?.data ?? response.data?.results ?? response.data ?? [];
          const grupos = Array.isArray(rawGrupos) ? rawGrupos : [];
          const atletasSet = new Set();
          const atletasList = [];
          
          grupos.forEach((grupo) => {
            if (grupo.atletas && Array.isArray(grupo.atletas)) {
              grupo.atletas.forEach((atleta) => {
                if (!atletasSet.has(atleta.id)) {
                  atletasSet.add(atleta.id);
                  const nombre = atleta.nombres || atleta.persona?.first_name || '';
                  const apellido = atleta.apellidos || atleta.persona?.last_name || '';
                  atletasList.push({
                    value: atleta.id,
                    label: `${nombre} ${apellido}`.trim() || `Atleta ${atleta.id}`,
                  });
                }
              });
            }
          });
          
          setAtletas(atletasList);
        } catch (secondError) {
          console.error('Error fetching atletas from grupos:', secondError);
          setAtletas([]);
        }
      } finally {
        setLoadingAtletas(false);
      }
    };

    fetchAtletas();
  }, []);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        atleta: initialData.atleta?.id || initialData.atleta || '',
        fecha_registro: initialData.fecha_registro || new Date().toISOString().split('T')[0],
        peso: initialData.peso || '',
        estatura: initialData.estatura || '',
        altura_sentado: initialData.altura_sentado || '',
        envergadura: initialData.envergadura || '',
        observaciones: initialData.observaciones || '',
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = async (data) => {
    // Si es edición, no enviar atleta ni fecha_registro
    if (isEditing) {
      const { atleta, fecha_registro, ...editData } = data;
      await onSubmit(editData);
    } else {
      await onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atleta <span className="text-red-500">*</span>
            {isEditing && <span className="text-gray-500 text-xs ml-1">(No editable)</span>}
          </label>
          {isEditing && initialData?.atleta ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
              <p className="font-medium">
                {initialData.atleta.nombres || initialData.atleta.persona?.first_name || ''} {initialData.atleta.apellidos || initialData.atleta.persona?.last_name || ''}
              </p>
              <input type="hidden" {...register('atleta')} />
            </div>
          ) : (
            <select
              {...register('atleta', { 
                setValueAs: (v) => v === '' ? '' : Number(v) 
              })}
              disabled={loadingAtletas}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.atleta ? 'border-red-500' : 'border-gray-300'
              } ${loadingAtletas ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">{loadingAtletas ? 'Cargando atletas...' : 'Seleccione un atleta'}</option>
              {atletas.map((atleta) => (
                <option key={atleta.value} value={atleta.value}>
                  {atleta.label}
                </option>
              ))}
            </select>
          )}
          {errors.atleta && (
            <p className="mt-1 text-sm text-red-500">{errors.atleta.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Registro <span className="text-red-500">*</span>
            {isEditing && <span className="text-gray-500 text-xs ml-1">(No editable)</span>}
          </label>
          {isEditing ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
              {new Date(initialData?.fecha_registro).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              <input type="hidden" {...register('fecha_registro')} />
            </div>
          ) : (
            <input
              type="date"
              min={getFechaMinima()}
              max={getFechaMaxima()}
              {...register('fecha_registro')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.fecha_registro ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )}
          {errors.fecha_registro && (
            <p className="mt-1 text-sm text-red-500">{errors.fecha_registro.message}</p>
          )}
          {!isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              No puede ser futura ni anterior a {FECHA_MAX_ANTIGUEDAD_ANOS} años
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Peso (kg)"
            type="number"
            step="0.01"
            min={PESO_MIN}
            max={PESO_MAX}
            placeholder={`Entre ${PESO_MIN} y ${PESO_MAX} kg`}
            {...register('peso', { 
              setValueAs: (v) => v === '' || v === null ? '' : parseFloat(v) 
            })}
            error={errors.peso?.message}
            touched={touchedFields.peso}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Rango válido: {PESO_MIN} - {PESO_MAX} kg
          </p>
        </div>

        <div>
          <Input
            label="Estatura (m)"
            type="number"
            step="0.01"
            min={ESTATURA_MIN}
            max={ESTATURA_MAX}
            placeholder={`Entre ${ESTATURA_MIN} y ${ESTATURA_MAX} m`}
            {...register('estatura', { 
              setValueAs: (v) => v === '' || v === null ? '' : parseFloat(v) 
            })}
            error={errors.estatura?.message}
            touched={touchedFields.estatura}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Rango válido: {ESTATURA_MIN} - {ESTATURA_MAX} m
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Altura Sentado (m)"
            type="number"
            step="0.01"
            min={ALTURA_SENTADO_MIN}
            max={ALTURA_SENTADO_MAX}
            placeholder={`Entre ${ALTURA_SENTADO_MIN} y ${ALTURA_SENTADO_MAX} m`}
            {...register('altura_sentado', { 
              setValueAs: (v) => v === '' || v === null ? '' : parseFloat(v) 
            })}
            error={errors.altura_sentado?.message}
            touched={touchedFields.altura_sentado}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Rango válido: {ALTURA_SENTADO_MIN} - {ALTURA_SENTADO_MAX} m (no mayor que estatura)
          </p>
        </div>

        <div>
          <Input
            label="Envergadura (m)"
            type="number"
            step="0.01"
            min={ENVERGADURA_MIN}
            max={ENVERGADURA_MAX}
            placeholder={`Entre ${ENVERGADURA_MIN} y ${ENVERGADURA_MAX} m`}
            {...register('envergadura', { 
              setValueAs: (v) => v === '' || v === null ? '' : parseFloat(v) 
            })}
            error={errors.envergadura?.message}
            touched={touchedFields.envergadura}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Rango válido: {ENVERGADURA_MIN} - {ENVERGADURA_MAX} m
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IMC (calculado)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={imc}
              disabled
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${imcClassification.bg} ${imcClassification.color}`}>
              {imcClassification.text}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Índice Córmico (calculado)
          </label>
          <input
            type="text"
            value={indiceCormico}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />
          <div className="mt-2 flex items-center space-x-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${cormicoClassification.bg} ${cormicoClassification.color}`}>
              {cormicoClassification.text}
            </span>
            <span className="text-xs text-gray-600">{cormicoClassification.detalle}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Valores normales: 50-55</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          {...register('observaciones')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="Observaciones adicionales..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} disabled={!isValid || loading}>
          {initialData ? 'Actualizar' : 'Crear'} Prueba
        </Button>
      </div>
    </form>
  );
};

export default PruebaAntropometricaForm;
