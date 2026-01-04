import React from 'react';
import { Modal } from '../common';
import PruebaAntropometricaForm from './PruebaAntropometricaForm';

const PruebaAntropometricaModal = ({
  isOpen,
  onClose,
  prueba,
  onSubmit,
  loading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={prueba ? 'Editar Prueba Antropométrica' : 'Nueva Prueba Antropométrica'}
      size="lg"
    >
      <PruebaAntropometricaForm
        initialData={prueba}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
};

export default PruebaAntropometricaModal;
