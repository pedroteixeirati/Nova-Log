import { useState } from 'react';
import { Payable } from '../types/payable.types';

export interface PayableFormData {
  sourceType: 'manual' | 'expense';
  sourceId: string;
  description: string;
  providerName: string;
  vehicleId: string;
  contractId: string;
  amount: number;
  dueDate: string;
  status: Payable['status'];
  paidAt: string;
  paymentMethod: string;
  proofUrl: string;
  notes: string;
}

export function defaultPayableFormData(): PayableFormData {
  const today = new Date().toISOString().split('T')[0];

  return {
    sourceType: 'manual',
    sourceId: '',
    description: '',
    providerName: '',
    vehicleId: '',
    contractId: '',
    amount: 0,
    dueDate: today,
    status: 'open',
    paidAt: '',
    paymentMethod: '',
    proofUrl: '',
    notes: '',
  };
}

export function usePayableForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [formData, setFormData] = useState<PayableFormData>(defaultPayableFormData());

  const openCreate = () => {
    setEditingPayable(null);
    setFormData(defaultPayableFormData());
    setSubmitError('');
    setSubmitSuccess('');
    setIsModalOpen(true);
  };

  const openEdit = (payable: Payable) => {
    setEditingPayable(payable);
    setFormData({
      sourceType: payable.sourceType,
      sourceId: payable.sourceId || '',
      description: payable.description,
      providerName: payable.providerName || '',
      vehicleId: payable.vehicleId || '',
      contractId: payable.contractId || '',
      amount: Number(payable.amount || 0),
      dueDate: payable.dueDate,
      status: payable.status,
      paidAt: payable.paidAt || '',
      paymentMethod: payable.paymentMethod || '',
      proofUrl: payable.proofUrl || '',
      notes: payable.notes || '',
    });
    setSubmitError('');
    setSubmitSuccess('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPayable(null);
    setFormData(defaultPayableFormData());
    setSubmitError('');
  };

  return {
    isModalOpen,
    editingPayable,
    formData,
    setFormData,
    submitError,
    setSubmitError,
    submitSuccess,
    setSubmitSuccess,
    openCreate,
    openEdit,
    closeModal,
  };
}
