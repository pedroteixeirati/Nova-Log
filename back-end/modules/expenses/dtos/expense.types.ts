export type ExpenseFinancialStatus = 'none' | 'open' | 'paid' | 'overdue' | 'canceled';

export type ExpenseInput = {
  date: string;
  time: string;
  costDate?: string;
  vehicleId: string;
  provider: string;
  category: string;
  quantity?: string | number;
  amount: string | number;
  odometer?: string | number;
  status: 'approved' | 'review' | 'pending';
  paymentRequired?: boolean | 'true' | 'false';
  financialStatus?: ExpenseFinancialStatus;
  dueDate?: string;
  paidAt?: string;
  linkedPayableId?: string | null;
  contractId?: string | null;
  freightId?: string | null;
  receiptUrl?: string;
  observations?: string;
};

export type ExpensePayload = {
  displayId?: number;
  date: string;
  time: string;
  costDate: string;
  vehicleId: string;
  vehicleName: string;
  provider: string;
  category: string;
  quantity: string;
  amount: number;
  odometer: string;
  status: 'approved' | 'review' | 'pending';
  paymentRequired: boolean;
  financialStatus: ExpenseFinancialStatus;
  dueDate: string;
  paidAt: string;
  linkedPayableId: string | null;
  contractId: string | null;
  freightId: string | null;
  receiptUrl: string;
  observations: string;
};

export type ExpenseSeed = ExpensePayload & {
  id: string;
};
