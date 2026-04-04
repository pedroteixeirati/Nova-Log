create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade_name text,
  slug text not null unique,
  cnpj text,
  state_registration text,
  municipal_registration text,
  tax_regime text,
  main_cnae text,
  secondary_cnaes text,
  opened_at text,
  legal_representative text,
  phone text,
  whatsapp text,
  email text,
  financial_email text,
  fiscal_email text,
  website text,
  zip_code text,
  ibge_code text,
  address_line text,
  address_number text,
  address_complement text,
  district text,
  city text,
  state text,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  plan text not null default 'starter',
  created_by_user_id uuid,
  updated_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists tenants add column if not exists trade_name text;
alter table if exists tenants add column if not exists state_registration text;
alter table if exists tenants add column if not exists municipal_registration text;
alter table if exists tenants add column if not exists tax_regime text;
alter table if exists tenants add column if not exists main_cnae text;
alter table if exists tenants add column if not exists secondary_cnaes text;
alter table if exists tenants add column if not exists opened_at text;
alter table if exists tenants add column if not exists legal_representative text;
alter table if exists tenants add column if not exists phone text;
alter table if exists tenants add column if not exists whatsapp text;
alter table if exists tenants add column if not exists email text;
alter table if exists tenants add column if not exists financial_email text;
alter table if exists tenants add column if not exists fiscal_email text;
alter table if exists tenants add column if not exists website text;
alter table if exists tenants add column if not exists zip_code text;
alter table if exists tenants add column if not exists ibge_code text;
alter table if exists tenants add column if not exists address_line text;
alter table if exists tenants add column if not exists address_number text;
alter table if exists tenants add column if not exists address_complement text;
alter table if exists tenants add column if not exists district text;
alter table if exists tenants add column if not exists city text;
alter table if exists tenants add column if not exists state text;
alter table if exists tenants add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists tenants add column if not exists updated_by_user_id uuid references users(id) on delete set null;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null unique,
  email text not null,
  role text not null default 'viewer' check (role in ('dev', 'owner', 'admin', 'financial', 'operational', 'driver', 'viewer')),
  name text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('dev', 'owner', 'admin', 'financial', 'operational', 'driver', 'viewer')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

alter table if exists users
  add column if not exists status text not null default 'active';
alter table if exists users
  add column if not exists role text not null default 'viewer';
alter table if exists users
  alter column role set default 'viewer';
update users set role = 'viewer' where role is null;
alter table if exists users
  drop constraint if exists users_role_check;
alter table if exists users
  add constraint users_role_check check (role in ('dev', 'owner', 'admin', 'financial', 'operational', 'driver', 'viewer'));

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  plate text not null,
  driver text not null,
  type text not null,
  km numeric not null default 0,
  next_maintenance text,
  status text not null check (status in ('active', 'maintenance', 'alert')),
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  type text not null,
  rating numeric not null default 5,
  status text not null,
  contact text not null,
  email text not null,
  address text not null,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  corporate_name text not null,
  trade_name text not null,
  cnpj text not null,
  state_registration text not null,
  municipal_registration text not null,
  legal_representative text not null,
  representative_cpf text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  contract_contact text,
  notes text,
  status text not null check (status in ('active', 'inactive')),
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  company_id uuid not null references companies(id) on delete restrict,
  company_name text not null,
  contract_name text not null,
  remuneration_type text not null default 'recurring' check (remuneration_type in ('recurring', 'per_trip')),
  annual_value numeric not null default 0,
  monthly_value numeric not null default 0,
  start_date text not null,
  end_date text not null,
  status text not null check (status in ('active', 'renewal', 'closed')),
  vehicle_ids text[] not null default '{}',
  vehicle_names text[] not null default '{}',
  notes text,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists freights (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  vehicle_id text not null,
  plate text not null,
  date text not null,
  route text not null,
  amount numeric not null default 0,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  date text not null,
  time text not null,
  vehicle_id text not null,
  vehicle_name text not null,
  provider text not null,
  category text not null,
  quantity text not null,
  amount numeric not null default 0,
  odometer text not null,
  status text not null check (status in ('approved', 'review', 'pending')),
  observations text not null,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists revenues (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  company_id uuid references companies(id) on delete restrict,
  company_name text,
  contract_id uuid references contracts(id) on delete cascade,
  contract_name text,
  freight_id uuid references freights(id) on delete cascade,
  competence_month integer not null check (competence_month between 1 and 12),
  competence_year integer not null,
  competence_label text not null,
  description text not null,
  amount numeric not null default 0,
  due_date text not null,
  status text not null default 'pending' check (status in ('pending', 'billed', 'received', 'overdue', 'canceled')),
  source_type text not null default 'contract' check (source_type in ('contract', 'freight', 'manual')),
  charge_reference text,
  charge_generated_at timestamptz,
  received_at timestamptz,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, contract_id, competence_month, competence_year)
);

alter table if exists revenues add column if not exists charge_reference text;
alter table if exists revenues add column if not exists charge_generated_at timestamptz;
alter table if exists revenues add column if not exists received_at timestamptz;
alter table if exists revenues add column if not exists freight_id uuid references freights(id) on delete cascade;
alter table if exists revenues alter column company_id drop not null;
alter table if exists revenues alter column company_name drop not null;
alter table if exists revenues alter column contract_id drop not null;
alter table if exists revenues alter column contract_name drop not null;
alter table if exists revenues drop constraint if exists revenues_status_check;
alter table if exists revenues
  add constraint revenues_status_check check (status in ('pending', 'billed', 'received', 'overdue', 'canceled'));
create unique index if not exists idx_revenues_contract_competence
  on revenues(tenant_id, contract_id, competence_month, competence_year)
  where contract_id is not null;
create unique index if not exists idx_revenues_freight_id
  on revenues(freight_id)
  where freight_id is not null;

alter table if exists vehicles add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists vehicles add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists vehicles add column if not exists updated_by_user_id uuid references users(id) on delete set null;
alter table if exists vehicles drop column if exists owner_uid;
alter table if exists providers add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists providers add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists providers add column if not exists updated_by_user_id uuid references users(id) on delete set null;
alter table if exists providers drop column if exists owner_uid;
alter table if exists companies add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists companies add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists companies add column if not exists updated_by_user_id uuid references users(id) on delete set null;
alter table if exists companies drop column if exists owner_uid;
alter table if exists contracts add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists contracts add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists contracts add column if not exists updated_by_user_id uuid references users(id) on delete set null;
alter table if exists contracts drop column if exists owner_uid;
alter table if exists contracts add column if not exists remuneration_type text not null default 'recurring';
update contracts set remuneration_type = 'recurring' where remuneration_type is null;
alter table if exists contracts drop constraint if exists contracts_remuneration_type_check;
alter table if exists contracts
  add constraint contracts_remuneration_type_check check (remuneration_type in ('recurring', 'per_trip'));
alter table if exists freights add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists freights add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists freights add column if not exists updated_by_user_id uuid references users(id) on delete set null;
alter table if exists freights drop column if exists owner_uid;
alter table if exists expenses add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists expenses add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists expenses add column if not exists updated_by_user_id uuid references users(id) on delete set null;
alter table if exists expenses drop column if exists owner_uid;
alter table if exists revenues add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists revenues add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists revenues add column if not exists updated_by_user_id uuid references users(id) on delete set null;

create index if not exists idx_tenant_users_tenant_id on tenant_users(tenant_id);
create index if not exists idx_tenant_users_user_id on tenant_users(user_id);
create unique index if not exists idx_tenants_cnpj_digits
  on tenants ((regexp_replace(cnpj, '\D', '', 'g')))
  where cnpj is not null and regexp_replace(cnpj, '\D', '', 'g') <> '';
create unique index if not exists idx_vehicles_tenant_plate
  on vehicles (tenant_id, upper(regexp_replace(plate, '[^A-Za-z0-9]', '', 'g')))
  where plate is not null and regexp_replace(plate, '[^A-Za-z0-9]', '', 'g') <> '';
create index if not exists idx_vehicles_tenant_id on vehicles(tenant_id);
create index if not exists idx_providers_tenant_id on providers(tenant_id);
create unique index if not exists idx_companies_tenant_cnpj
  on companies (tenant_id, regexp_replace(cnpj, '\D', '', 'g'))
  where cnpj is not null and regexp_replace(cnpj, '\D', '', 'g') <> '';
create index if not exists idx_companies_tenant_id on companies(tenant_id);
create index if not exists idx_contracts_tenant_id on contracts(tenant_id);
create index if not exists idx_freights_tenant_id on freights(tenant_id);
create index if not exists idx_expenses_tenant_id on expenses(tenant_id);
create index if not exists idx_revenues_tenant_id on revenues(tenant_id);
