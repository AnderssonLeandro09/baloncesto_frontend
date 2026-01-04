import React from 'react';
import { FiEye, FiEdit2, FiToggleLeft, FiToggleRight, FiMail } from 'react-icons/fi';
import { Table, Button } from '../common';

const PruebaAntropometricaTable = ({
  data,
  loading,
  onView,
  onEdit,
  onToggleEstado,
  onShareReport,
  actionLoadingId,
}) => {
  const columns = [
    {
      key: 'fecha_registro',
      title: 'Fecha de Registro',
      render: (value) => new Date(value).toLocaleDateString('es-ES'),
    },
    {
      key: 'atleta',
      title: 'Atleta',
      render: (_, row) =>
        row.atleta?.nombre_atleta && row.atleta?.apellido_atleta
          ? `${row.atleta.nombre_atleta} ${row.atleta.apellido_atleta}`
          : 'N/A',
    },
    {
      key: 'peso',
      title: 'Peso (kg)',
      render: (value) => `${value} kg`,
    },
    {
      key: 'estatura',
      title: 'Estatura (m)',
      render: (value) => `${value} m`,
    },
    {
      key: 'imc',
      title: 'IMC',
      render: (value) => value?.toFixed(2) || 'N/A',
    },
    {
      key: 'indice_cormico',
      title: 'Índice Córmico',
      render: (value) => value?.toFixed(2) || 'N/A',
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row)}
            disabled={loading || actionLoadingId === row.id}
            className="p-1"
          >
            <FiEye className="w-4 h-4" />
          </Button>
          {row.estado && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              disabled={loading || actionLoadingId === row.id}
              className="p-1"
            >
              <FiEdit2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleEstado(row)}
            disabled={loading || actionLoadingId === row.id}
            className="p-1"
          >
            {row.estado ? (
              <FiToggleRight className="w-4 h-4 text-green-600" />
            ) : (
              <FiToggleLeft className="w-4 h-4 text-red-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShareReport(row)}
            disabled={loading || actionLoadingId === row.id}
            className="p-1"
          >
            <FiMail className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      emptyMessage="No hay pruebas antropométricas registradas"
    />
  );
};

export default PruebaAntropometricaTable;
