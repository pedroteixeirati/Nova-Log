import type { PayablePayload, PayableRow } from '../dtos/payable.types';

export function serializePayable(payable: PayablePayload | PayableRow | Record<string, unknown>) {
  return { ...payable };
}

export function serializePayables(payables: Array<PayablePayload | PayableRow | Record<string, unknown>>) {
  return payables.map(serializePayable);
}
