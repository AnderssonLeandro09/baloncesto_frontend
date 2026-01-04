import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Button } from '../common';
import apiClient from '../../api/apiClient';

const positiveNumber = (label) =>
  yup
    .number()
    .typeError(`${label} es requerido`)
    .transform((value, originalValue) => {
      return originalValue === '' || originalValue === null ? undefined : value;
    })
    .moreThan(0, `${label} debe ser mayor a 0`)
    .required(`${label} es requerido`);

const schema = yup.object({
  atleta: positiveNumber('El atleta'),
  fecha_registro: yup
    .string()
    .required('La fecha de registro es requerida'),
  peso: positiveNumber('El peso'),
  estatura: positiveNumber('La estatura'),
  altura_sentado: positiveNumber('La altura sentado').test(
    'altura-sentado-validation',
    'La altura sentado no puede ser mayor que la estatura',
    function (value) {
      const estatura = this.parent.estatura;
      if (typeof value !== 'number' || typeof estatura !== 'number') return false;
      return value <= estatura;
    }
  ),
  envergadura: positiveNumber('La envergadura').test(
    'envergadura-validation',
    'La envergadura debe ser al menos la estatura menos 0.05 m',
    function (value) {
      const estatura = this.parent.estatura;
      if (typeof value !== 'number' || typeof estatura !== 'number') return false;
      return value >= estatura - 0.05;
    }
  ),
  observaciones: yup.string().optional(),
});

const PruebaAntropometricaForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [atletas, setAtletas] = React.useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      atleta: initialData?.atleta || '',
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

  // Calcular Índice Córmico automáticamente
  const indiceCormico =
    typeof alturaSentado === 'number' && typeof estatura === 'number' && estatura > 0
      ? (alturaSentado / estatura).toFixed(2)
      : '0.00';

  useEffect(() => {
    const fetchAtletas = async () => {
      try {
        // Obtener atletas desde inscripciones activas
        const response = await apiClient.get('/inscripciones', {
          params: { estado: true }
        });
        const inscripciones = response.data?.results || response.data || [];
        
        // Extraer atletas únicos de las inscripciones
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
        
        setAtletas(Array.from(atletasMap.values()));
      } catch (error) {
        console.error('Error fetching atletas:', error);
        // Si falla, intentar cargar desde grupos-atletas
        try {
          const response = await apiClient.get('/grupos-atletas');
          const grupos = response.data?.results || response.data || [];
          const atletasSet = new Set();
          const atletasList = [];
          
          grupos.forEach((grupo) => {
            if (grupo.atletas && Array.isArray(grupo.atletas)) {
              grupo.atletas.forEach((atleta) => {
                if (!atletasSet.has(atleta.id)) {
                  atletasSet.add(atleta.id);
                  atletasList.push({
                    value: atleta.id,
                    label: `${atleta.persona?.first_name || ''} ${atleta.persona?.last_name || ''}`.trim() || `Atleta ${atleta.id}`,
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
      }
    };

    fetchAtletas();
  }, []);

  const onFormSubmit = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atleta <span className="text-red-500">*</span>
          </label>
          <select
            {...register('atleta', { 
              setValueAs: (v) => v === '' ? '' : Number(v) 
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.atleta ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccione un atleta</option>
            {atletas.map((atleta) => (
              <option key={atleta.value} value={atleta.value}>
                {atleta.label}
              </option>
            ))}
          </select>
          {errors.atleta && (
            <p className="mt-1 text-sm text-red-500">{errors.atleta.message}</p>
          )}
        </div>

        <Input
          label="Fecha de Registro"
          type="date"
          {...register('fecha_registro')}
          error={errors.fecha_registro?.message}
          touched={touchedFields.fecha_registro}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Peso (kg)"
          type="number"
          step="0.01"
          min="0.01"
          {...register('peso', { 
            setValueAs: (v) => v === '' || v === null ? '' : parseFloat(v) 
          })}
          error={errors.peso?.message}
          touched={touchedFields.peso}
          required
        />

        <Input
          label="Estatura (m)"
          type="number"
          step="0.01"
          min="0.01"
          {...register('estatura', { 
            setValueAs: (v) => v === '' || v === null ? '' : parseFloat(v) 
          })}
          error={errors.estatura?.message}
          touched={touchedFields.estatura}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Altura Sentado (m)"
          type="number"
          step="0.01"
          min="0.01"
          {...register('altura_sentado', { 
            setValueAs: (v) => v === '' || v === null ? '' : parseFloat(v) 
          })}
          error={errors.altura_sentado?.message}
          touched={touchedFields.altura_sentado}
          required
        />

        <Input
          label="Envergadura (m)"
          type="number"
          step="0.01"
          min="0.01"
          {...register('envergadura', { 
            setValueAs: (v) => v === '' || v === null ? '' : parseFloat(v) 
          })}
          error={errors.envergadura?.message}
          touched={touchedFields.envergadura}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="IMC (calculado)"
          value={imc}
          disabled
          className="bg-gray-100"
        />

        <Input
          label="Índice Córmico (calculado)"
          value={indiceCormico}
          disabled
          className="bg-gray-100"
        />
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
