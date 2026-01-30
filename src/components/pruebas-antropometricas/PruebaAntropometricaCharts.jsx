import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area } from 'recharts';
import { Select, Card } from '../common';
import usePruebaAntropometricaStore from '../../stores/pruebaAntropometricaStore';
import apiClient from '../../api/apiClient';
import { clasificarIMC, clasificarIndiceCormico } from '../../utils/validacionesAntropometricas';

const PruebaAntropometricaCharts = () => {
  const [selectedAtleta, setSelectedAtleta] = useState(null);
  const [atletas, setAtletas] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getPruebasByAtleta } = usePruebaAntropometricaStore();

  useEffect(() => {
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
        setAtletas([]);
      }
    };

    fetchAtletas();
  }, []);

  const fetchChartData = useCallback(async () => {
    if (!selectedAtleta) {
      setChartData([]);
      return;
    }

    setLoading(true);
    try {
      const pruebas = await getPruebasByAtleta(selectedAtleta);
      const sortedPruebas = (pruebas || [])
        .filter(p => p.estado)
        .sort((a, b) => new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime());

      const data = sortedPruebas.map(prueba => {
        const imcVal = parseFloat(prueba.indice_masa_corporal || prueba.imc || 0);
        const cormVal = parseFloat(prueba.indice_cormico || 0);
        const imcCls = clasificarIMC(imcVal);
        const cormCls = clasificarIndiceCormico(cormVal);
        return {
        fecha: new Date(prueba.fecha_registro).toLocaleDateString('es-ES'),
        imc: imcVal,
        imcCategoria: imcCls.text,
        imcColor: imcCls.hexColor,
        peso: parseFloat(prueba.peso || 0),
        estatura: parseFloat(prueba.estatura || 0),
        alturaSentado: parseFloat(prueba.altura_sentado || 0),
        envergadura: parseFloat(prueba.envergadura || 0),
        indiceCormico: cormVal,
        cormicoCategoria: cormCls.text,
        cormicoColor: cormCls.hexColor,
      };
      });

      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAtleta, getPruebasByAtleta]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Calcular estadísticas
  const estadisticas = chartData.length > 0 ? {
    pesoPromedio: (chartData.reduce((acc, d) => acc + d.peso, 0) / chartData.length).toFixed(2),
    imcPromedio: (chartData.reduce((acc, d) => acc + d.imc, 0) / chartData.length).toFixed(2),
    estaturaPromedio: (chartData.reduce((acc, d) => acc + d.estatura, 0) / chartData.length).toFixed(2),
    totalRegistros: chartData.length,
  } : null;

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <Select
            label="Seleccionar Atleta"
            value={selectedAtleta || ''}
            onChange={(e) => setSelectedAtleta(e.target.value ? Number(e.target.value) : null)}
            options={[{ value: '', label: 'Seleccione un atleta' }, ...atletas]}
            className="w-full md:w-96"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            Cargando datos...
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {selectedAtleta 
              ? 'No hay datos disponibles para este atleta' 
              : 'Seleccione un atleta para ver sus gráficas'}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Resumen Estadístico */}
            {estadisticas && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-600 font-medium">Peso Promedio</p>
                  <p className="text-2xl font-bold text-blue-800">{estadisticas.pesoPromedio} kg</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-600 font-medium">IMC Promedio</p>
                  <p className="text-2xl font-bold text-green-800">{estadisticas.imcPromedio}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-yellow-600 font-medium">Estatura Promedio</p>
                  <p className="text-2xl font-bold text-yellow-800">{estadisticas.estaturaPromedio} m</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-purple-600 font-medium">Total Registros</p>
                  <p className="text-2xl font-bold text-purple-800">{estadisticas.totalRegistros}</p>
                </div>
              </div>
            )}

            {/* Legend de categorías */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#2563eb' }}></span><span className="text-sm text-gray-700">IMC: Insuficiente</span></div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }}></span><span className="text-sm text-gray-700">IMC: Normal</span></div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></span><span className="text-sm text-gray-700">IMC: Sobrepeso</span></div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#2563eb' }}></span><span className="text-sm text-gray-700">Córmico: Braquicórmico</span></div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }}></span><span className="text-sm text-gray-700">Córmico: Mesocórmico</span></div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></span><span className="text-sm text-gray-700">Córmico: Macrosquélico</span></div>
            </div>

            {/* Gráfica de IMC */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Evolución del IMC</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => [value.toFixed(2), '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="imc" fill="#8884d8" fillOpacity={0.15} stroke="#8884d8" name="IMC" />
                  <Line
                    type="monotone"
                    dataKey="imc"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={({ cx, cy, payload }) => (
                      <circle cx={cx} cy={cy} r={4} fill={payload.imcColor || '#8884d8'} strokeWidth={2} />
                    )}
                    name="IMC"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2">
                IMC Insuficiente: &lt; 18.5 | Normal: 18.5 - 24.9 | Sobrepeso: ≥ 25
              </p>
            </div>

            {/* Gráfica de Peso */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Evolución del Peso</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => [`${value.toFixed(2)} kg`, 'Peso']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="peso" stroke="#82ca9d" strokeWidth={2} dot={{ fill: '#82ca9d', strokeWidth: 2 }} name="Peso (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica de Estatura vs Envergadura */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Comparativa: Estatura vs Envergadura</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => [`${value.toFixed(2)} m`, '']}
                  />
                  <Legend />
                  <Bar dataKey="estatura" fill="#ffc658" name="Estatura (m)" />
                  <Bar dataKey="envergadura" fill="#ff7300" name="Envergadura (m)" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2">
                En baloncesto, una envergadura mayor a la estatura es favorable
              </p>
            </div>

            {/* Gráfica de Índice Córmico */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Evolución del Índice Córmico</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => [value.toFixed(2), 'Índice Córmico']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="indiceCormico"
                    stroke="#e91e63"
                    strokeWidth={2}
                    dot={({ cx, cy, payload }) => (
                      <circle cx={cx} cy={cy} r={4} fill={payload.cormicoColor || '#e91e63'} strokeWidth={2} />
                    )}
                    name="Índice Córmico"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2">
                Índice Córmico = (Altura Sentado / Estatura) × 100 | Categorías: Braquicórmico (&lt;50), Mesocórmico (50-55), Macrosquélico (&gt;55)
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PruebaAntropometricaCharts;
