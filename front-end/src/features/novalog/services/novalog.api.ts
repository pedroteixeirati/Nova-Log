import { apiRequest, createCrudApi } from '../../../shared/lib/api-client';
import { NovalogEntry } from '../types/novalog.types';

export interface NovalogBatchCreatePayload {
  weekNumber: number;
  operationDate: string;
  originName: string;
  entries: Array<{
    destinationName: string;
    weight: number;
    companyRatePerTon: number;
    aggregatedRatePerTon: number;
    ticketNumber?: string;
    fuelStationName?: string;
  }>;
}

const crudApi = createCrudApi<NovalogEntry>('/api/novalog/entries');

export const novalogApi = {
  ...crudApi,
  createBatch: (payload: NovalogBatchCreatePayload) =>
    apiRequest<NovalogEntry[]>(
      '/api/novalog/entries/batch',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
};
