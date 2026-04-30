export interface Revenue {
  id: string;
  displayId?: number;
  companyId: string;
  companyName: string;
  contractId: string;
  contractName: string;
  freightId?: string;
  novalogBillingId?: string;
  novalogBillingItemId?: string;
  competenceMonth: number;
  competenceYear: number;
  competenceLabel: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'billed' | 'received' | 'overdue' | 'canceled';
  sourceType: 'contract' | 'freight' | 'manual' | 'novalog_billing_item';
  chargeReference?: string;
  chargeGeneratedAt?: string;
  receivedAt?: string;
  createdAt: string;
}
