import type { ExpenseFinancialStatus, ExpenseInput, ExpensePayload } from '../dtos/expense.types';
import {
  isNonNegativeNumber,
  isPositiveNumber,
  isValidDate,
  isValidTime,
  isValidUuid,
  normalizeOptionalText,
  normalizeRequiredText,
} from '../../../shared/validation/validation';
import { findTenantVehicleForExpense } from '../repositories/expenses.repository';
import { expenseErrors } from '../errors/expenses.errors';

function parseBooleanInput(value: ExpenseInput['paymentRequired']) {
  return value === true || value === 'true';
}

function isValidReceiptUrl(value: string) {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export async function validateExpensePayload(body: ExpenseInput, tenantId: string): Promise<ExpensePayload> {
  const date = normalizeRequiredText(body.date);
  const time = normalizeRequiredText(body.time);
  const costDate = normalizeOptionalText(body.costDate) || date;
  const vehicleId = normalizeRequiredText(body.vehicleId);
  const provider = normalizeRequiredText(body.provider);
  const category = normalizeRequiredText(body.category);
  const quantity = String(body.quantity ?? '').trim();
  const amount = Number(body.amount ?? 0);
  const odometer = String(body.odometer ?? '').trim();
  const status = body.status;
  const paymentRequired = parseBooleanInput(body.paymentRequired);
  const requestedFinancialStatus = normalizeOptionalText(body.financialStatus);
  let financialStatus: ExpenseFinancialStatus = paymentRequired
    ? ((requestedFinancialStatus as ExpenseFinancialStatus | null) || 'open')
    : 'none';
  let dueDate = paymentRequired ? (normalizeOptionalText(body.dueDate) || costDate) : '';
  let paidAt = paymentRequired ? (normalizeOptionalText(body.paidAt) || '') : '';
  let linkedPayableId = paymentRequired ? (normalizeOptionalText(body.linkedPayableId) || null) : null;
  const contractId = normalizeOptionalText(body.contractId);
  const freightId = normalizeOptionalText(body.freightId);
  const receiptUrl = normalizeOptionalText(body.receiptUrl);
  const observations = normalizeOptionalText(body.observations);

  if (!isValidDate(date)) throw expenseErrors.invalidDate();
  if (!isValidTime(time)) throw expenseErrors.invalidTime();
  if (!isValidDate(costDate)) throw expenseErrors.invalidDate();
  if (!isValidUuid(vehicleId)) throw expenseErrors.invalidVehicle();
  if (provider.length < 2) throw expenseErrors.invalidProvider();
  if (category.length < 2) throw expenseErrors.invalidCategory();
  if (!isPositiveNumber(amount)) throw expenseErrors.invalidAmount();
  if (quantity && !isNonNegativeNumber(quantity)) throw expenseErrors.invalidQuantity();
  if (odometer && !isNonNegativeNumber(odometer)) throw expenseErrors.invalidOdometer();
  if (!['approved', 'review', 'pending'].includes(status)) throw expenseErrors.invalidStatus();
  if (!['none', 'open', 'paid', 'overdue', 'canceled'].includes(financialStatus)) throw expenseErrors.invalidFinancialStatus();
  if (paymentRequired && dueDate && !isValidDate(dueDate)) throw expenseErrors.invalidDueDate();
  if (paidAt && !isValidDate(paidAt)) throw expenseErrors.invalidPaidAt();
  if (linkedPayableId && !isValidUuid(linkedPayableId)) throw expenseErrors.invalidLinkedPayable();
  if (contractId && !isValidUuid(contractId)) throw expenseErrors.invalidContract();
  if (freightId && !isValidUuid(freightId)) throw expenseErrors.invalidFreight();
  if (receiptUrl && !isValidReceiptUrl(receiptUrl)) throw expenseErrors.invalidReceiptUrl();

  if (!paymentRequired) {
    financialStatus = 'none';
    dueDate = '';
    paidAt = '';
    linkedPayableId = null;
  }

  if (paymentRequired && financialStatus === 'paid' && !paidAt) {
    paidAt = dueDate || costDate;
  }

  const vehicle = await findTenantVehicleForExpense(vehicleId, tenantId);
  if (!vehicle) throw expenseErrors.vehicleNotFound();

  return {
    date,
    time,
    costDate,
    vehicleId,
    vehicleName: vehicle.name,
    provider,
    category,
    quantity,
    amount,
    odometer,
    status,
    paymentRequired,
    financialStatus,
    dueDate,
    paidAt,
    linkedPayableId,
    contractId: contractId || null,
    freightId: freightId || null,
    receiptUrl: receiptUrl || '',
    observations: observations || '',
  };
}
