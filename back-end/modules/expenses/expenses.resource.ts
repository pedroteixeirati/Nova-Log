import type { ResourceConfig } from '../../shared/resources/resources';

export const expensesResource: ResourceConfig = {
  table: 'expenses',
  orderBy: 'date desc, time desc',
  permissions: {
    read: ['dev', 'owner', 'admin', 'financial', 'operational', 'viewer'],
    create: ['dev', 'owner', 'admin', 'operational'],
    update: ['dev', 'owner', 'admin', 'operational'],
    delete: ['dev', 'owner', 'admin', 'operational'],
  },
  fields: [
    { api: 'date', db: 'date' },
    { api: 'time', db: 'time' },
    { api: 'costDate', db: 'cost_date' },
    { api: 'vehicleId', db: 'vehicle_id' },
    { api: 'vehicleName', db: 'vehicle_name' },
    { api: 'provider', db: 'provider' },
    { api: 'category', db: 'category' },
    { api: 'quantity', db: 'quantity', type: 'number' },
    { api: 'amount', db: 'amount', type: 'number' },
    { api: 'odometer', db: 'odometer' },
    { api: 'status', db: 'status' },
    { api: 'paymentRequired', db: 'payment_required' },
    { api: 'financialStatus', db: 'financial_status' },
    { api: 'dueDate', db: 'due_date' },
    { api: 'paidAt', db: 'paid_at' },
    { api: 'linkedPayableId', db: 'linked_payable_id' },
    { api: 'contractId', db: 'contract_id' },
    { api: 'freightId', db: 'freight_id' },
    { api: 'receiptUrl', db: 'receipt_url' },
    { api: 'observations', db: 'observations' },
  ],
};
