export interface Expense {
  id: string;
  displayId?: number;
  date: string;
  time: string;
  costDate?: string;
  vehicleId: string;
  vehicleName: string;
  provider: string;
  category: string;
  quantity: string;
  amount: number;
  odometer: string;
  status: 'approved' | 'review' | 'pending';
  paymentRequired?: boolean;
  financialStatus?: 'none' | 'open' | 'paid' | 'overdue' | 'canceled';
  dueDate?: string;
  paidAt?: string;
  linkedPayableId?: string | null;
  contractId?: string | null;
  freightId?: string | null;
  receiptUrl?: string;
  observations: string;
}
