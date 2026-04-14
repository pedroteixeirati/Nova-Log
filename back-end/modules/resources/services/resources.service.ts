import type { AuthContext } from '../../auth/dtos/auth-context';
import type { ExpenseSeed } from '../../expenses/dtos/expense.types';
import type { FreightRevenueSeedRow } from '../../revenues/dtos/revenue.types';
import { removeExpensePayable, syncExpensePayable } from '../../payables/services/payables.service';
import { syncFreightRevenue } from '../../revenues/services/revenues.service';
import { resources, type ResourceConfig } from '../../../shared/resources/resources';
import { validateSimpleResourcePayload } from './resource-payload.service';
import {
  createResourceRow,
  deleteFreightRevenueLink,
  deleteResourceRow,
  listResourceRows,
  updateResourceRow,
} from '../repositories/resources.repository';

function mapRow<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  fields: { api: string; db: string; type?: 'number' }[]
) {
  const mapped: Record<string, unknown> = {
    id: row.id,
    displayId: row.display_id !== null && row.display_id !== undefined ? Number(row.display_id) : undefined,
  };
  for (const field of fields) {
    const value = row[field.db];
    mapped[field.api] = field.type === 'number' && value !== null && value !== undefined
      ? Number(value)
      : value;
  }
  return mapped as T;
}

export function mapResourceRow<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  resource: ResourceConfig
) {
  return mapRow<T>(row, resource.fields);
}

export function getResourceConfig(resourceName: string): ResourceConfig | null {
  return resources[resourceName] || null;
}

export async function buildResourcePayload(
  resourceName: string,
  body: Record<string, unknown>,
  tenantId: string,
  recordId?: string
) {
  const payload = await validateSimpleResourcePayload(resourceName, body, tenantId, recordId);
  return payload ?? body;
}

export async function listResources(resourceName: string, auth?: AuthContext) {
  const resource = getResourceConfig(resourceName);
  if (!resource) {
    return null;
  }

  return listResourcesByConfig(resource, auth);
}

async function syncFreightIfNeeded(resourceName: string, row: Record<string, unknown>, userId?: string, tenantId?: string) {
  if (resourceName !== 'freights') {
    return;
  }

  const origin = String(row.origin || '');
  const destination = String(row.destination || '');

  await syncFreightRevenue(tenantId, {
    id: row.id as string,
    plate: String(row.plate || ''),
    contract_id: (row.contract_id as string | null) || null,
    contract_name: (row.contract_name as string | null) || null,
    billing_type: (row.billing_type as FreightRevenueSeedRow['billing_type']) || 'standalone',
    date: String(row.date || ''),
    origin,
    destination,
    amount: row.amount as string | number,
  }, userId);
}

async function syncExpenseIfNeeded(resourceName: string, row: Record<string, unknown>, userId?: string, tenantId?: string) {
  if (resourceName !== 'expenses') {
    return;
  }

  await syncExpensePayable({
    id: row.id as string,
    displayId: row.displayId as number | undefined,
    date: String(row.date || ''),
    time: String(row.time || ''),
    costDate: String(row.costDate || row.date || ''),
    vehicleId: String(row.vehicleId || ''),
    vehicleName: String(row.vehicleName || ''),
    provider: String(row.provider || ''),
    category: String(row.category || ''),
    quantity: String(row.quantity || ''),
    amount: Number(row.amount || 0),
    odometer: String(row.odometer || ''),
    status: (row.status as ExpenseSeed['status']) || 'pending',
    paymentRequired: Boolean(row.paymentRequired),
    financialStatus: (row.financialStatus as ExpenseSeed['financialStatus']) || 'none',
    dueDate: String(row.dueDate || ''),
    paidAt: String(row.paidAt || ''),
    linkedPayableId: (row.linkedPayableId as string | null) || null,
    contractId: (row.contractId as string | null) || null,
    freightId: (row.freightId as string | null) || null,
    receiptUrl: String(row.receiptUrl || ''),
    observations: String(row.observations || ''),
  }, tenantId, userId);
}

export async function createResource(resourceName: string, auth: AuthContext | undefined, body: Record<string, unknown>) {
  const resource = getResourceConfig(resourceName);
  if (!resource) {
    return null;
  }

  return createResourceByConfig(resourceName, resource, auth, body);
}

export async function updateResource(resourceName: string, auth: AuthContext | undefined, id: string, body: Record<string, unknown>) {
  const resource = getResourceConfig(resourceName);
  if (!resource) {
    return null;
  }

  return updateResourceByConfig(resourceName, resource, auth, id, body);
}

export async function listResourcesByConfig(resource: ResourceConfig, auth?: AuthContext) {
  const rows = await listResourceRows(resource, auth?.tenantId);
  return rows.map((row) => mapRow(row, resource.fields));
}

export async function createResourceByConfig(
  resourceName: string,
  resource: ResourceConfig,
  auth: AuthContext | undefined,
  body: Record<string, unknown>
) {
  const payload = await buildResourcePayload(resourceName, body, auth?.tenantId || '');
  const row = await createResourceRow(resource, payload as Record<string, unknown>, auth?.tenantId, auth?.userId);
  if (!row) {
    return null;
  }

  await syncFreightIfNeeded(resourceName, row, auth?.userId, auth?.tenantId);
  const mapped = mapRow(row, resource.fields);
  await syncExpenseIfNeeded(resourceName, mapped, auth?.userId, auth?.tenantId);
  return resourceName === 'expenses'
    ? await getUpdatedExpenseResource(resource, auth?.tenantId, mapped.id as string, mapped)
    : mapped;
}

export async function updateResourceByConfig(
  resourceName: string,
  resource: ResourceConfig,
  auth: AuthContext | undefined,
  id: string,
  body: Record<string, unknown>
) {
  const payload = await buildResourcePayload(resourceName, body, auth?.tenantId || '', id);
  const row = await updateResourceRow(resource, payload as Record<string, unknown>, id, auth?.tenantId, auth?.userId);
  if (!row) {
    return undefined;
  }

  await syncFreightIfNeeded(resourceName, row, auth?.userId, auth?.tenantId);
  const mapped = mapRow(row, resource.fields);
  await syncExpenseIfNeeded(resourceName, mapped, auth?.userId, auth?.tenantId);
  return resourceName === 'expenses'
    ? await getUpdatedExpenseResource(resource, auth?.tenantId, mapped.id as string, mapped)
    : mapped;
}

async function getUpdatedExpenseResource(
  resource: ResourceConfig,
  tenantId: string | undefined,
  id: string,
  fallback: Record<string, unknown>
) {
  const rows = await listResourceRows(resource, tenantId);
  const fresh = rows.find((row) => row.id === id);
  return fresh ? mapRow(fresh, resource.fields) : fallback;
}

export async function removeResource(resourceName: string, auth: AuthContext | undefined, id: string) {
  const resource = getResourceConfig(resourceName);
  if (!resource) {
    return null;
  }

  return removeResourceByConfig(resourceName, resource, auth, id);
}

export async function removeResourceByConfig(
  resourceName: string,
  resource: ResourceConfig,
  auth: AuthContext | undefined,
  id: string
) {
  if (resourceName === 'freights') {
    await deleteFreightRevenueLink(id, auth?.tenantId);
  }
  if (resourceName === 'expenses') {
    await removeExpensePayable(id, auth?.tenantId);
  }

  const deleted = await deleteResourceRow(resource, id, auth?.tenantId);
  return deleted ? true : false;
}
