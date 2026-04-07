import { pool } from '../../../shared/infra/database/pool';
import type { PayablePayload, PayableRow } from '../dtos/payable.types';

export async function findTenantVehicleForPayable(vehicleId: string, tenantId: string) {
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

export async function findTenantContractForPayable(contractId: string, tenantId: string) {
  const result = await pool.query<{ id: string }>(
    `select id
     from contracts
     where id = $1
       and tenant_id = $2
     limit 1`,
    [contractId, tenantId]
  );

  return result.rows[0] || null;
}

function selectColumns() {
  return `id,
          display_id,
          source_type,
          source_id,
          description,
          provider_name,
          vehicle_id,
          vehicle_name,
          contract_id,
          amount,
          due_date,
          status,
          paid_at,
          payment_method,
          proof_url,
          notes`;
}

export async function listTenantPayables(tenantId?: string) {
  const result = await pool.query<PayableRow>(
    `select ${selectColumns()}
     from payables
     where tenant_id = $1
     order by due_date asc, created_at desc`,
    [tenantId]
  );

  return result.rows;
}

export async function findPayableBySource(sourceType: 'expense' | 'manual', sourceId: string, tenantId?: string) {
  const result = await pool.query<PayableRow>(
    `select ${selectColumns()}
     from payables
     where tenant_id = $1
       and source_type = $2
       and source_id = $3
     limit 1`,
    [tenantId, sourceType, sourceId]
  );

  return result.rows[0] || null;
}

export async function createTenantPayable(payload: PayablePayload, tenantId?: string, userId?: string) {
  const result = await pool.query<PayableRow>(
    `insert into payables (
       tenant_id,
       source_type,
       source_id,
       description,
       provider_name,
       vehicle_id,
       vehicle_name,
       contract_id,
       amount,
       due_date,
       status,
       paid_at,
       payment_method,
       proof_url,
       notes,
       created_by_user_id,
       updated_by_user_id
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16)
     returning ${selectColumns()}`,
    [
      tenantId,
      payload.sourceType,
      payload.sourceId,
      payload.description,
      payload.providerName || null,
      payload.vehicleId,
      payload.vehicleName || null,
      payload.contractId,
      payload.amount,
      payload.dueDate,
      payload.status,
      payload.paidAt || null,
      payload.paymentMethod || null,
      payload.proofUrl || null,
      payload.notes || null,
      userId,
    ]
  );

  return result.rows[0] || null;
}

export async function updateTenantPayable(id: string, payload: PayablePayload, tenantId?: string, userId?: string) {
  const result = await pool.query<PayableRow>(
    `update payables
     set source_type = $1,
         source_id = $2,
         description = $3,
         provider_name = $4,
         vehicle_id = $5,
         vehicle_name = $6,
         contract_id = $7,
         amount = $8,
         due_date = $9,
         status = $10,
         paid_at = $11,
         payment_method = $12,
         proof_url = $13,
         notes = $14,
         updated_by_user_id = $15,
         updated_at = now()
     where id = $16
       and tenant_id = $17
     returning ${selectColumns()}`,
    [
      payload.sourceType,
      payload.sourceId,
      payload.description,
      payload.providerName || null,
      payload.vehicleId,
      payload.vehicleName || null,
      payload.contractId,
      payload.amount,
      payload.dueDate,
      payload.status,
      payload.paidAt || null,
      payload.paymentMethod || null,
      payload.proofUrl || null,
      payload.notes || null,
      userId,
      id,
      tenantId,
    ]
  );

  return result.rows[0] || null;
}

export async function deleteTenantPayable(id: string, tenantId?: string) {
  const result = await pool.query(
    `delete from payables
     where id = $1
       and tenant_id = $2
     returning id`,
    [id, tenantId]
  );

  return result.rows[0] || null;
}

export async function deletePayableBySource(sourceType: 'expense' | 'manual', sourceId: string, tenantId?: string) {
  const result = await pool.query(
    `delete from payables
     where tenant_id = $1
       and source_type = $2
       and source_id = $3
     returning id`,
    [tenantId, sourceType, sourceId]
  );

  return result.rows[0] || null;
}

export async function markPayableAsPaid(id: string, tenantId?: string, userId?: string) {
  const result = await pool.query<PayableRow>(
    `update payables
     set status = 'paid',
         paid_at = coalesce(paid_at, to_char(current_date, 'YYYY-MM-DD')),
         updated_by_user_id = $1,
         updated_at = now()
     where id = $2
       and tenant_id = $3
       and status in ('open', 'overdue')
     returning ${selectColumns()}`,
    [userId, id, tenantId]
  );

  return result.rows[0] || null;
}

export async function markPayableAsOverdue(id: string, tenantId?: string, userId?: string) {
  const result = await pool.query<PayableRow>(
    `update payables
     set status = 'overdue',
         updated_by_user_id = $1,
         updated_at = now()
     where id = $2
       and tenant_id = $3
       and status = 'open'
     returning ${selectColumns()}`,
    [userId, id, tenantId]
  );

  return result.rows[0] || null;
}
