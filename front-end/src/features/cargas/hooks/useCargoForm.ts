import { useState } from 'react';
import { FormFieldErrors } from '../../../lib/errors';
import { Cargo, CargoStatus } from '../types/cargo.types';

export interface CargoFormData {
  freightId: string;
  companyId: string;
  cargoNumber: string;
  description: string;
  cargoType: string;
  weight: string;
  volume: string;
  unitCount: string;
  merchandiseValue: string;
  origin: string;
  destination: string;
  status: CargoStatus;
  scheduledDate: string;
  deliveredAt: string;
  notes: string;
}

export type CargoFormField =
  | 'freightId'
  | 'companyId'
  | 'cargoNumber'
  | 'description'
  | 'cargoType'
  | 'weight'
  | 'volume'
  | 'unitCount'
  | 'merchandiseValue'
  | 'origin'
  | 'destination'
  | 'status'
  | 'scheduledDate'
  | 'deliveredAt'
  | 'notes';

export const defaultCargoFormData: CargoFormData = {
  freightId: '',
  companyId: '',
  cargoNumber: '',
  description: '',
  cargoType: '',
  weight: '',
  volume: '',
  unitCount: '',
  merchandiseValue: '',
  origin: '',
  destination: '',
  status: 'planned',
  scheduledDate: '',
  deliveredAt: '',
  notes: '',
};

export function useCargoForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors<CargoFormField>>({});
  const [formData, setFormData] = useState<CargoFormData>(defaultCargoFormData);

  const openCreate = (defaults?: Partial<CargoFormData>) => {
    setSubmitError('');
    setSubmitSuccess('');
    setFieldErrors({});
    setEditingCargo(null);
    setFormData({
      ...defaultCargoFormData,
      ...defaults,
    });
    setIsModalOpen(true);
  };

  const openEdit = (cargo: Cargo) => {
    setSubmitError('');
    setSubmitSuccess('');
    setFieldErrors({});
    setEditingCargo(cargo);
    setFormData({
      freightId: cargo.freightId,
      companyId: cargo.companyId,
      cargoNumber: cargo.cargoNumber || '',
      description: cargo.description,
      cargoType: cargo.cargoType,
      weight: cargo.weight ? String(cargo.weight) : '',
      volume: cargo.volume ? String(cargo.volume) : '',
      unitCount: cargo.unitCount ? String(cargo.unitCount) : '',
      merchandiseValue: cargo.merchandiseValue ? String(cargo.merchandiseValue) : '',
      origin: cargo.origin,
      destination: cargo.destination,
      status: cargo.status,
      scheduledDate: cargo.scheduledDate || '',
      deliveredAt: cargo.deliveredAt || '',
      notes: cargo.notes || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCargo(null);
    setFormData(defaultCargoFormData);
    setSubmitError('');
    setSubmitSuccess('');
    setFieldErrors({});
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    editingCargo,
    formData,
    setFormData,
    fieldErrors,
    setFieldErrors,
    submitError,
    setSubmitError,
    submitSuccess,
    setSubmitSuccess,
    openCreate,
    openEdit,
    closeModal,
  };
}
