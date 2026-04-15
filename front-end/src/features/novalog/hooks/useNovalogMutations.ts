import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/query-keys';
import { NovalogEntry } from '../types/novalog.types';
import { novalogApi, NovalogBatchCreatePayload } from '../services/novalog.api';

export function useNovalogMutations() {
  const queryClient = useQueryClient();

  const invalidateNovalog = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.novalog.all });
  };

  const createEntry = useMutation({
    mutationFn: (payload: Omit<NovalogEntry, 'id' | 'displayId'>) => novalogApi.create(payload),
    onSuccess: invalidateNovalog,
  });

  const createBatch = useMutation({
    mutationFn: (payload: NovalogBatchCreatePayload) => novalogApi.createBatch(payload),
    onSuccess: invalidateNovalog,
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<NovalogEntry, 'id' | 'displayId'>> }) => novalogApi.update(id, payload),
    onSuccess: invalidateNovalog,
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => novalogApi.remove(id),
    onSuccess: invalidateNovalog,
  });

  return {
    createEntry,
    createBatch,
    updateEntry,
    deleteEntry,
    isSubmitting:
      createEntry.isPending ||
      createBatch.isPending ||
      updateEntry.isPending ||
      deleteEntry.isPending,
  };
}
