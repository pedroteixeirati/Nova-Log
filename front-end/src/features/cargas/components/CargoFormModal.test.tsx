import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CargoFormModal from './CargoFormModal';
import { defaultCargoFormData } from '../hooks/useCargoForm';

describe('CargoFormModal', () => {
  it('mantem submit desabilitado enquanto obrigatorios estao vazios', () => {
    render(
      <CargoFormModal
        isOpen
        editing={false}
        submitError=""
        fieldErrors={{}}
        isSubmitting={false}
        formData={defaultCargoFormData}
        freights={[{ id: 'freight-1', route: 'Campinas x Santos', plate: 'ABC-1234', vehicleId: 'vehicle-1', date: '2026-04-10', amount: 1000 }]}
        companies={[{ id: 'company-1', tradeName: 'Atlas', corporateName: 'Atlas Ltda', cnpj: '', stateRegistration: '', municipalRegistration: '', legalRepresentative: '', representativeCpf: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', status: 'active' }]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onChange={vi.fn()}
        onClearFieldError={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Cadastrar carga/i })).toBeDisabled();
  });

  it('habilita submit quando obrigatorios estao preenchidos', () => {
    render(
      <CargoFormModal
        isOpen
        editing={false}
        submitError=""
        fieldErrors={{}}
        isSubmitting={false}
        formData={{
          ...defaultCargoFormData,
          freightId: 'freight-1',
          companyId: 'company-1',
          description: 'Carga fracionada',
          cargoType: 'Alimentos',
          origin: 'Campinas/SP',
          destination: 'Santos/SP',
        }}
        freights={[{ id: 'freight-1', route: 'Campinas x Santos', plate: 'ABC-1234', vehicleId: 'vehicle-1', date: '2026-04-10', amount: 1000 }]}
        companies={[{ id: 'company-1', tradeName: 'Atlas', corporateName: 'Atlas Ltda', cnpj: '', stateRegistration: '', municipalRegistration: '', legalRepresentative: '', representativeCpf: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', status: 'active' }]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onChange={vi.fn()}
        onClearFieldError={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Cadastrar carga/i })).toBeEnabled();
  });
});
