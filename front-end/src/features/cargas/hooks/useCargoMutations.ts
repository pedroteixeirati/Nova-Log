import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/query-keys';
import { cargasApi } from '../services/cargas.api';
import { Cargo } from '../types/cargo.types';

export function useCargoMutations() {
  const queryClient = useQueryClient();

  const invalidateCargas = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.cargas.all });
  };

  const createCargo = useMutation({
    mutationFn: (payload: Omit<Cargo, 'id'>) => cargasApi.create(payload),
    onSuccess: invalidateCargas,
  });

  const updateCargo = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<Cargo, 'id'>> }) =>
      cargasApi.update(id, payload),
    onSuccess: invalidateCargas,
  });

  const deleteCargo = useMutation({
    mutationFn: (id: string) => cargasApi.remove(id),
    onSuccess: invalidateCargas,
  });

  return {
    createCargo,
    updateCargo,
    deleteCargo,
    isSubmitting: createCargo.isPending || updateCargo.isPending || deleteCargo.isPending,
  };
}
