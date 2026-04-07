import { pool } from '../../../shared/infra/database/pool';
import type { ExpenseFinancialStatus } from '../dtos/expense.types';

export async function findTenantVehicleForExpense(vehicleId: string, tenantId: string) {
  const result = await pool.query<{ id: string; name: string }>(
    `select id, name
     from vehicles
     where id = $1
       and tenant_id = $2
     limit 1`,
    [vehicleId, tenantId]
  );

  return result.rows[0] || null;
}

export async function syncExpensePayableLink(
  expenseId: string,
  tenantId: string,
  linkedPayableId: string | null,
  financialStatus: ExpenseFinancialStatus,
  paidAt = ''
) {
  await pool.query(
    `update expenses
     set linked_payable_id = $1,
         financial_status = $2,
         paid_at = $3,
         updated_at = now()
     where id = $4
       and tenant_id = $5`,
    [linkedPayableId, financialStatus, paidAt || null, expenseId, tenantId]
  );
}
