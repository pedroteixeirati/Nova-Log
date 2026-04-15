import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/query-keys';
import { novalogApi } from '../services/novalog.api';

export function useNovalogQuery(enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.novalog.list(),
    queryFn: novalogApi.list,
    enabled,
  });

  const entries = useMemo(() => {
    const items = query.data ?? [];

    return [...items].sort((left, right) => (left.displayId ?? Number.MAX_SAFE_INTEGER) - (right.displayId ?? Number.MAX_SAFE_INTEGER));
  }, [query.data]);

  return {
    entries,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
