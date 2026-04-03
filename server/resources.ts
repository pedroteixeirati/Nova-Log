import { ResourcePermissions } from './permissions';

type FieldMap = {
  api: string;
  db: string;
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
      { api: 'km', db: 'km' },
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
      { api: 'rating', db: 'rating' },
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
      { api: 'annualValue', db: 'annual_value' },
      { api: 'monthlyValue', db: 'monthly_value' },
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
      { api: 'amount', db: 'amount' },
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
      { api: 'quantity', db: 'quantity' },
      { api: 'amount', db: 'amount' },
      { api: 'odometer', db: 'odometer' },
      { api: 'status', db: 'status' },
      { api: 'observations', db: 'observations' },
    ],
  },
};
