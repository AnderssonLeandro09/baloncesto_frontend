import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, Card } from '../common';
import usePruebaAntropometricaStore from '../../stores/pruebaAntropometricaStore';
import apiClient from '../../api/apiClient';

const PruebaAntropometricaCharts = () => {
  const [selectedAtleta, setSelectedAtleta] = useState(null);
  const [atletas, setAtletas] = useState([]);
  const [chartData, setChartData] = useState([]);

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
        setAtletas([]);
      }
    };

    fetchAtletas();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!selectedAtleta) {
        setChartData([]);
        return;
      }

      try {
        const pruebas = await getPruebasByAtleta(selectedAtleta);
        const sortedPruebas = pruebas
          .filter(p => p.estado)
          .sort((a, b) => new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime());

        const data = sortedPruebas.map(prueba => ({
          fecha: new Date(prueba.fecha_registro).toLocaleDateString('es-ES'),
          imc: prueba.imc,
          peso: prueba.peso,
          estatura: prueba.estatura,
        }));

        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, [selectedAtleta, getPruebasByAtleta]);

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

        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {selectedAtleta 
              ? 'No hay datos disponibles para este atleta' 
              : 'Seleccione un atleta para ver sus gráficas'}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Gráfica de IMC */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Evolución del IMC</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="imc" stroke="#8884d8" name="IMC" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica de Peso */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Evolución del Peso</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="peso" stroke="#82ca9d" name="Peso (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica de Estatura */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Evolución de la Estatura</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="estatura" stroke="#ffc658" name="Estatura (m)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PruebaAntropometricaCharts;
