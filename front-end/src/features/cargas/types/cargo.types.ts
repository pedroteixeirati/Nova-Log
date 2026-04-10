export type CargoStatus = 'planned' | 'loading' | 'in_transit' | 'delivered' | 'cancelled';

export interface Cargo {
  id: string;
  displayId?: number;
  freightId: string;
  freightDisplayId?: number;
  freightRoute?: string;
  companyId: string;
  companyName?: string;
  cargoNumber?: string;
  description: string;
  cargoType: string;
  weight?: number;
  volume?: number;
  unitCount?: number;
  merchandiseValue?: number;
  origin: string;
  destination: string;
  status: CargoStatus;
  scheduledDate?: string;
  deliveredAt?: string;
  notes?: string;
}
