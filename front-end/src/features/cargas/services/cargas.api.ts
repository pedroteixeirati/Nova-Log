import { apiRequest, createCrudApi } from '../../../shared/lib/api-client';
import { Cargo } from '../types/cargo.types';

export const cargasApi = {
  ...createCrudApi<Cargo>('/api/cargas'),
  listByFreight: (freightId: string) => apiRequest<Cargo[]>(`/api/freights/${freightId}/cargas`),
};
