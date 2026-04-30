-- Up Migration

create extension if not exists pgcrypto;

create table if not exists novalog_billings (
  id uuid primary key default gen_random_uuid(),
  display_id bigint,
  tenant_id uuid not null references tenants(id) on delete cascade,
  company_id uuid not null references companies(id) on delete restrict,
  company_name text not null,
  billing_date text not null,
  due_date text not null,
  status text not null default 'draft',
  notes text,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists novalog_billings add column if not exists display_id bigint;
alter table if exists novalog_billings add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists novalog_billings add column if not exists company_id uuid references companies(id) on delete restrict;
alter table if exists novalog_billings add column if not exists company_name text;
alter table if exists novalog_billings add column if not exists billing_date text;
alter table if exists novalog_billings add column if not exists due_date text;
alter table if exists novalog_billings add column if not exists status text default 'draft';
alter table if exists novalog_billings add column if not exists notes text;
alter table if exists novalog_billings add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists novalog_billings add column if not exists updated_by_user_id uuid references users(id) on delete set null;
alter table if exists novalog_billings add column if not exists created_at timestamptz default now();
alter table if exists novalog_billings add column if not exists updated_at timestamptz default now();

update novalog_billings set status = 'draft' where status is null;
update novalog_billings set created_at = now() where created_at is null;
update novalog_billings set updated_at = now() where updated_at is null;

alter table if exists novalog_billings alter column tenant_id set not null;
alter table if exists novalog_billings alter column company_id set not null;
alter table if exists novalog_billings alter column company_name set not null;
alter table if exists novalog_billings alter column billing_date set not null;
alter table if exists novalog_billings alter column due_date set not null;
alter table if exists novalog_billings alter column status set not null;
alter table if exists novalog_billings alter column created_at set not null;
alter table if exists novalog_billings alter column updated_at set not null;

alter table if exists novalog_billings drop constraint if exists novalog_billings_status_check;
alter table if exists novalog_billings
  add constraint novalog_billings_status_check
  check (status in ('draft', 'open', 'partially_received', 'received', 'overdue', 'canceled'));

create table if not exists novalog_billing_items (
  id uuid primary key default gen_random_uuid(),
  display_id bigint,
  tenant_id uuid not null references tenants(id) on delete cascade,
  billing_id uuid not null references novalog_billings(id) on delete cascade,
  cte_number text not null,
  cte_key text,
  issue_date text,
  origin_name text,
  destination_name text,
  amount numeric not null default 0,
  status text not null default 'pending',
  received_at timestamptz,
  notes text,
  linked_revenue_id uuid references revenues(id) on delete set null,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists novalog_billing_items add column if not exists display_id bigint;
alter table if exists novalog_billing_items add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table if exists novalog_billing_items add column if not exists billing_id uuid references novalog_billings(id) on delete cascade;
alter table if exists novalog_billing_items add column if not exists cte_number text;
alter table if exists novalog_billing_items add column if not exists cte_key text;
alter table if exists novalog_billing_items add column if not exists issue_date text;
alter table if exists novalog_billing_items add column if not exists origin_name text;
alter table if exists novalog_billing_items add column if not exists destination_name text;
alter table if exists novalog_billing_items add column if not exists amount numeric default 0;
alter table if exists novalog_billing_items add column if not exists status text default 'pending';
alter table if exists novalog_billing_items add column if not exists received_at timestamptz;
alter table if exists novalog_billing_items add column if not exists notes text;
alter table if exists novalog_billing_items add column if not exists linked_revenue_id uuid references revenues(id) on delete set null;
alter table if exists novalog_billing_items add column if not exists created_by_user_id uuid references users(id) on delete set null;
alter table if exists novalog_billing_items add column if not exists updated_by_user_id uuid references users(id) on delete set null;
alter table if exists novalog_billing_items add column if not exists created_at timestamptz default now();
alter table if exists novalog_billing_items add column if not exists updated_at timestamptz default now();

update novalog_billing_items set amount = 0 where amount is null;
update novalog_billing_items set status = 'pending' where status is null;
update novalog_billing_items set created_at = now() where created_at is null;
update novalog_billing_items set updated_at = now() where updated_at is null;

alter table if exists novalog_billing_items alter column tenant_id set not null;
alter table if exists novalog_billing_items alter column billing_id set not null;
alter table if exists novalog_billing_items alter column cte_number set not null;
alter table if exists novalog_billing_items alter column amount set not null;
alter table if exists novalog_billing_items alter column status set not null;
alter table if exists novalog_billing_items alter column created_at set not null;
alter table if exists novalog_billing_items alter column updated_at set not null;

alter table if exists novalog_billing_items drop constraint if exists novalog_billing_items_status_check;
alter table if exists novalog_billing_items
  add constraint novalog_billing_items_status_check
  check (status in ('pending', 'billed', 'received', 'overdue', 'canceled'));

alter table if exists revenues add column if not exists novalog_billing_id uuid;
alter table if exists revenues add column if not exists novalog_billing_item_id uuid;

alter table if exists revenues drop constraint if exists revenues_source_type_check;
alter table if exists revenues
  add constraint revenues_source_type_check
  check (source_type in ('contract', 'freight', 'manual', 'novalog_billing_item'));

alter table if exists revenues drop constraint if exists revenues_novalog_billing_id_fkey;
alter table if exists revenues
  add constraint revenues_novalog_billing_id_fkey
  foreign key (novalog_billing_id) references novalog_billings(id) on delete set null;

alter table if exists revenues drop constraint if exists revenues_novalog_billing_item_id_fkey;
alter table if exists revenues
  add constraint revenues_novalog_billing_item_id_fkey
  foreign key (novalog_billing_item_id) references novalog_billing_items(id) on delete set null;

create or replace function assign_tenant_display_id()
returns trigger
language plpgsql
as $$
declare
  next_display_id bigint;
begin
  if new.display_id is not null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext(tg_table_name || ':' || coalesce(new.tenant_id::text, 'global')));

  execute format('select coalesce(max(display_id), 0) + 1 from %I where tenant_id = $1', tg_table_name)
    into next_display_id
    using new.tenant_id;

  new.display_id := next_display_id;
  return new;
end;
$$;

with numbered as (
  select id, row_number() over (partition by tenant_id order by created_at asc, id asc) as next_display_id
  from novalog_billings
  where display_id is null
)
update novalog_billings billing
set display_id = numbered.next_display_id
from numbered
where billing.id = numbered.id;

with numbered as (
  select id, row_number() over (partition by tenant_id order by created_at asc, id asc) as next_display_id
  from novalog_billing_items
  where display_id is null
)
update novalog_billing_items item
set display_id = numbered.next_display_id
from numbered
where item.id = numbered.id;

drop trigger if exists trg_novalog_billings_display_id on novalog_billings;
create trigger trg_novalog_billings_display_id
before insert on novalog_billings
for each row
execute function assign_tenant_display_id();

drop trigger if exists trg_novalog_billing_items_display_id on novalog_billing_items;
create trigger trg_novalog_billing_items_display_id
before insert on novalog_billing_items
for each row
execute function assign_tenant_display_id();

create unique index if not exists idx_novalog_billings_tenant_display_id
  on novalog_billings(tenant_id, display_id)
  where display_id is not null;

create index if not exists idx_novalog_billings_tenant_id
  on novalog_billings(tenant_id);

create index if not exists idx_novalog_billings_company_id
  on novalog_billings(tenant_id, company_id);

create index if not exists idx_novalog_billings_status
  on novalog_billings(tenant_id, status);

create index if not exists idx_novalog_billings_due_date
  on novalog_billings(tenant_id, due_date);

create unique index if not exists idx_novalog_billing_items_tenant_display_id
  on novalog_billing_items(tenant_id, display_id)
  where display_id is not null;

create index if not exists idx_novalog_billing_items_billing_id
  on novalog_billing_items(tenant_id, billing_id);

create index if not exists idx_novalog_billing_items_status
  on novalog_billing_items(tenant_id, status);

create unique index if not exists idx_novalog_billing_items_tenant_cte_number
  on novalog_billing_items(tenant_id, cte_number)
  where cte_number is not null and cte_number <> '' and status <> 'canceled';

create unique index if not exists idx_revenues_novalog_billing_item_id
  on revenues(novalog_billing_item_id)
  where novalog_billing_item_id is not null;

-- Down Migration

drop index if exists idx_revenues_novalog_billing_item_id;
drop index if exists idx_novalog_billing_items_tenant_cte_number;
drop index if exists idx_novalog_billing_items_status;
drop index if exists idx_novalog_billing_items_billing_id;
drop index if exists idx_novalog_billing_items_tenant_display_id;
drop index if exists idx_novalog_billings_due_date;
drop index if exists idx_novalog_billings_status;
drop index if exists idx_novalog_billings_company_id;
drop index if exists idx_novalog_billings_tenant_id;
drop index if exists idx_novalog_billings_tenant_display_id;

drop trigger if exists trg_novalog_billing_items_display_id on novalog_billing_items;
drop trigger if exists trg_novalog_billings_display_id on novalog_billings;

alter table if exists revenues drop constraint if exists revenues_novalog_billing_item_id_fkey;
alter table if exists revenues drop constraint if exists revenues_novalog_billing_id_fkey;
alter table if exists revenues drop column if exists novalog_billing_item_id;
alter table if exists revenues drop column if exists novalog_billing_id;
alter table if exists revenues drop constraint if exists revenues_source_type_check;
alter table if exists revenues
  add constraint revenues_source_type_check
  check (source_type in ('contract', 'freight', 'manual'));

drop table if exists novalog_billing_items;
drop table if exists novalog_billings;
