import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/query-keys';
import { cargasApi } from '../services/cargas.api';

interface UseCargasQueryOptions {
  enabled: boolean;
  freightId?: string;
}

export function useCargasQuery({ enabled, freightId }: UseCargasQueryOptions) {
  const cargasQuery = useQuery({
    queryKey: freightId ? queryKeys.cargas.freight(freightId) : queryKeys.cargas.list(),
    queryFn: () => (freightId ? cargasApi.listByFreight(freightId) : cargasApi.list()),
    enabled,
  });

  const cargas = useMemo(() => cargasQuery.data ?? [], [cargasQuery.data]);

  return {
    cargas,
    isLoading: cargasQuery.isLoading,
    error: cargasQuery.error ?? null,
    refetch: cargasQuery.refetch,
  };
}
