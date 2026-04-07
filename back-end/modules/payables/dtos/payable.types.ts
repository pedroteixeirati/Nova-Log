export type PayableStatus = 'open' | 'paid' | 'overdue' | 'canceled';
export type PayableSourceType = 'expense' | 'manual';

export type PayableInput = {
  sourceType?: PayableSourceType;
  sourceId?: string | null;
  description: string;
  providerName?: string;
  vehicleId?: string | null;
  contractId?: string | null;
  amount: string | number;
  dueDate: string;
  status?: PayableStatus;
  paidAt?: string;
  paymentMethod?: string;
  proofUrl?: string;
  notes?: string;
};

export type PayablePayload = {
  displayId?: number;
  sourceType: PayableSourceType;
  sourceId: string | null;
  description: string;
  providerName: string;
  vehicleId: string | null;
  vehicleName: string;
  contractId: string | null;
  amount: number;
  dueDate: string;
  status: PayableStatus;
  paidAt: string;
  paymentMethod: string;
  proofUrl: string;
  notes: string;
};

export type PayableRow = {
  id: string;
  display_id: number | null;
  source_type: PayableSourceType;
  source_id: string | null;
  description: string;
  provider_name: string | null;
  vehicle_id: string | null;
  vehicle_name: string | null;
  contract_id: string | null;
  amount: string | number;
  due_date: string;
  status: PayableStatus;
  paid_at: string | null;
  payment_method: string | null;
  proof_url: string | null;
  notes: string | null;
};
