export interface Contract {
  id: string;
  displayId?: number;
  companyId?: string;
  companyName: string;
  contractName: string;
  remunerationType: 'recurring' | 'per_trip';
  annualValue: number;
  monthlyValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'renewal' | 'closed';
  vehicleIds: string[];
  vehicleNames: string[];
  notes?: string;
}
