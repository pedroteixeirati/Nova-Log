import type { ResourcePermissions } from './permissions.ts';

type FieldMap = {
  api: string;
  db: string;
  type?: 'number';
};

export type ResourceConfig = {
  table: string;
  orderBy: string;
  fields: FieldMap[];
  permissions: ResourcePermissions;
};

export const resources: Record<string, ResourceConfig> = {
  vehicles: {
    table: 'vehicles',
    orderBy: 'created_at desc',
    permissions: {
      read: ['dev', 'owner', 'admin', 'financial', 'operational', 'driver', 'viewer'],
      create: ['dev', 'owner', 'admin', 'operational'],
      update: ['dev', 'owner', 'admin', 'operational'],
      delete: ['dev', 'owner', 'admin', 'operational'],
    },
    fields: [
      { api: 'name', db: 'name' },
      { api: 'plate', db: 'plate' },
      { api: 'driver', db: 'driver' },
      { api: 'type', db: 'type' },
      { api: 'km', db: 'km', type: 'number' },
      { api: 'nextMaintenance', db: 'next_maintenance' },
      { api: 'status', db: 'status' },
    ],
  },
  providers: {
    table: 'providers',
    orderBy: 'created_at desc',
    permissions: {
      read: ['dev', 'owner', 'admin', 'financial', 'operational', 'viewer'],
      create: ['dev', 'owner', 'admin', 'operational'],
      update: ['dev', 'owner', 'admin', 'operational'],
      delete: ['dev', 'owner', 'admin', 'operational'],
    },
    fields: [
      { api: 'name', db: 'name' },
      { api: 'type', db: 'type' },
      { api: 'rating', db: 'rating', type: 'number' },
      { api: 'status', db: 'status' },
      { api: 'contact', db: 'contact' },
      { api: 'email', db: 'email' },
      { api: 'address', db: 'address' },
    ],
  },
  companies: {
    table: 'companies',
    orderBy: 'created_at desc',
    permissions: {
      read: ['dev', 'owner', 'admin', 'financial', 'operational', 'viewer'],
      create: ['dev', 'owner', 'admin', 'operational'],
      update: ['dev', 'owner', 'admin', 'operational'],
      delete: ['dev', 'owner', 'admin', 'operational'],
    },
    fields: [
      { api: 'corporateName', db: 'corporate_name' },
      { api: 'tradeName', db: 'trade_name' },
      { api: 'cnpj', db: 'cnpj' },
      { api: 'stateRegistration', db: 'state_registration' },
      { api: 'municipalRegistration', db: 'municipal_registration' },
      { api: 'legalRepresentative', db: 'legal_representative' },
      { api: 'representativeCpf', db: 'representative_cpf' },
      { api: 'email', db: 'email' },
      { api: 'phone', db: 'phone' },
      { api: 'address', db: 'address' },
      { api: 'city', db: 'city' },
      { api: 'state', db: 'state' },
      { api: 'zipCode', db: 'zip_code' },
      { api: 'contractContact', db: 'contract_contact' },
      { api: 'notes', db: 'notes' },
      { api: 'status', db: 'status' },
    ],
  },
  contracts: {
    table: 'contracts',
    orderBy: 'created_at desc',
    permissions: {
      read: ['dev', 'owner', 'admin', 'financial', 'operational', 'viewer'],
      create: ['dev', 'owner', 'admin', 'operational'],
      update: ['dev', 'owner', 'admin', 'operational'],
      delete: ['dev', 'owner', 'admin'],
    },
    fields: [
      { api: 'companyId', db: 'company_id' },
      { api: 'companyName', db: 'company_name' },
      { api: 'contractName', db: 'contract_name' },
      { api: 'remunerationType', db: 'remuneration_type' },
      { api: 'annualValue', db: 'annual_value', type: 'number' },
      { api: 'monthlyValue', db: 'monthly_value', type: 'number' },
      { api: 'startDate', db: 'start_date' },
      { api: 'endDate', db: 'end_date' },
      { api: 'status', db: 'status' },
      { api: 'vehicleIds', db: 'vehicle_ids' },
      { api: 'vehicleNames', db: 'vehicle_names' },
      { api: 'notes', db: 'notes' },
    ],
  },
  freights: {
    table: 'freights',
    orderBy: 'date desc',
    permissions: {
      read: ['dev', 'owner', 'admin', 'financial', 'operational', 'driver', 'viewer'],
      create: ['dev', 'owner', 'admin', 'operational', 'driver'],
      update: ['dev', 'owner', 'admin', 'operational', 'driver'],
      delete: ['dev', 'owner', 'admin', 'operational'],
    },
    fields: [
      { api: 'vehicleId', db: 'vehicle_id' },
      { api: 'plate', db: 'plate' },
      { api: 'date', db: 'date' },
      { api: 'route', db: 'route' },
      { api: 'amount', db: 'amount', type: 'number' },
    ],
  },
  expenses: {
    table: 'expenses',
    orderBy: 'date desc, time desc',
    permissions: {
      read: ['dev', 'owner', 'admin', 'financial', 'operational', 'viewer'],
      create: ['dev', 'owner', 'admin', 'financial'],
      update: ['dev', 'owner', 'admin', 'financial'],
      delete: ['dev', 'owner', 'admin', 'financial'],
    },
    fields: [
      { api: 'date', db: 'date' },
      { api: 'time', db: 'time' },
      { api: 'vehicleId', db: 'vehicle_id' },
      { api: 'vehicleName', db: 'vehicle_name' },
      { api: 'provider', db: 'provider' },
      { api: 'category', db: 'category' },
      { api: 'quantity', db: 'quantity', type: 'number' },
      { api: 'amount', db: 'amount', type: 'number' },
      { api: 'odometer', db: 'odometer' },
      { api: 'status', db: 'status' },
      { api: 'observations', db: 'observations' },
    ],
  },
};
