import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/query-keys';
import { novalogBillingsApi } from '../services/novalog-billings.api';
import { NovalogBillingPayload } from '../types/novalog-billing.types';

export function useNovalogBillingsMutations() {
  const queryClient = useQueryClient();

  const invalidateBillings = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.novalogBillings.all });
    await queryClient.invalidateQueries({ queryKey: ['revenues'] });
  };

  const createBilling = useMutation({
    mutationFn: (payload: NovalogBillingPayload) => novalogBillingsApi.create(payload),
    onSuccess: invalidateBillings,
  });

  const updateBilling = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NovalogBillingPayload }) => novalogBillingsApi.update(id, payload),
    onSuccess: invalidateBillings,
  });

  const closeBilling = useMutation({
    mutationFn: (id: string) => novalogBillingsApi.close(id),
    onSuccess: invalidateBillings,
  });

  const markItemReceived = useMutation({
    mutationFn: (id: string) => novalogBillingsApi.markItemReceived(id),
    onSuccess: invalidateBillings,
  });

  const markItemOverdue = useMutation({
    mutationFn: (id: string) => novalogBillingsApi.markItemOverdue(id),
    onSuccess: invalidateBillings,
  });

  const cancelItem = useMutation({
    mutationFn: (id: string) => novalogBillingsApi.cancelItem(id),
    onSuccess: invalidateBillings,
  });

  return {
    createBilling,
    updateBilling,
    closeBilling,
    markItemReceived,
    markItemOverdue,
    cancelItem,
    isSubmitting:
      createBilling.isPending ||
      updateBilling.isPending ||
      closeBilling.isPending ||
      markItemReceived.isPending ||
      markItemOverdue.isPending ||
      cancelItem.isPending,
  };
}
