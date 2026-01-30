import React from 'react';
import { FiEye, FiEdit2, FiToggleLeft, FiToggleRight, FiMail, FiPrinter } from 'react-icons/fi';
import { Table, Button } from '../common';
import { clasificarIMC, clasificarIndiceCormico } from '../../utils/validacionesAntropometricas';

const PruebaAntropometricaTable = ({
  data,
  loading,
  onView,
  onEdit,
  onToggleEstado,
  onShareReport,
  onPrintReport,
  actionLoadingId,
}) => {
  // Función auxiliar para obtener nombre del atleta
  const getAtletaNombre = (row) => {
    if (row.atleta) {
      // Si es un objeto con nombre y apellido
      if (row.atleta.nombre_atleta || row.atleta.apellido_atleta) {
        return `${row.atleta.nombre_atleta || ''} ${row.atleta.apellido_atleta || ''}`.trim();
      }
      // Si tiene nombres y apellidos
      if (row.atleta.nombres || row.atleta.apellidos) {
        return `${row.atleta.nombres || ''} ${row.atleta.apellidos || ''}`.trim();
      }
      // Si es un string
      if (typeof row.atleta === 'string') {
        return row.atleta;
      }
      // Si tiene id pero no nombre
      if (row.atleta.id) {
        return `Atleta #${row.atleta.id}`;
      }
    }
    return 'N/A';
  };

  // Auxiliar para badge combinando bg + text
  const badgeClass = (bg, text) => `px-2 py-1 text-xs font-medium rounded-full ${bg} ${text}`;

  const columns = [
    {
      key: 'fecha_registro',
      title: 'Fecha',
      render: (value) => new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    },
    {
      key: 'atleta',
      title: 'Atleta',
      render: (_, row) => (
        <span className="font-medium text-gray-900">
          {getAtletaNombre(row)}
        </span>
      ),
    },
    {
      key: 'peso',
      title: 'Peso',
      render: (value) => (
        <span className="text-gray-700">{parseFloat(value).toFixed(1)} kg</span>
      ),
    },
    {
      key: 'estatura',
      title: 'Estatura',
      render: (value) => (
        <span className="text-gray-700">{parseFloat(value).toFixed(2)} m</span>
      ),
    },
    {
      key: 'imc',
      title: 'IMC',
      render: (_, row) => {
        const imc = row.indice_masa_corporal || row.imc || 0;
        const cls = clasificarIMC(parseFloat(imc));
        return (
          <div className="flex items-center space-x-2">
            <span className={badgeClass(cls.bg, cls.color)}>
              {parseFloat(imc).toFixed(2)}
            </span>
            <span className={badgeClass(cls.bg, cls.color)}>
              {cls.text}
            </span>
          </div>
        );
      },
    },
    {
      key: 'indice_cormico',
      title: 'Índ. Córmico',
      render: (value) => {
        const val = value ? parseFloat(value) : 0;
        const cls = clasificarIndiceCormico(val);
        return (
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">{val ? val.toFixed(2) : 'N/A'}</span>
            {val ? (
              <span className={badgeClass(cls.bg, cls.color)}>{cls.text}</span>
            ) : null}
          </div>
        );
      },
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
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row)}
            disabled={loading || actionLoadingId === row.id}
            className="p-1 hover:bg-blue-50"
            title="Ver detalles"
          >
            <FiEye className="w-4 h-4 text-blue-600" />
          </Button>
          {row.estado && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              disabled={loading || actionLoadingId === row.id}
              className="p-1 hover:bg-yellow-50"
              title="Editar"
            >
              <FiEdit2 className="w-4 h-4 text-yellow-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleEstado(row)}
            disabled={loading || actionLoadingId === row.id}
            className="p-1 hover:bg-gray-50"
            title={row.estado ? 'Desactivar' : 'Activar'}
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
            className="p-1 hover:bg-purple-50"
            title="Enviar por email"
          >
            <FiMail className="w-4 h-4 text-purple-600" />
          </Button>
          {onPrintReport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPrintReport(row)}
              disabled={loading || actionLoadingId === row.id}
              className="p-1 hover:bg-gray-50"
              title="Imprimir reporte"
            >
              <FiPrinter className="w-4 h-4 text-gray-600" />
            </Button>
          )}
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
