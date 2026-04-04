import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schema = readFileSync(resolve(process.cwd(), 'server/schema.sql'), 'utf8');
const appSource = readFileSync(resolve(process.cwd(), 'server/app.ts'), 'utf8');

test('tabelas centrais possuem tenant_id no schema', () => {
  for (const table of ['vehicles', 'providers', 'companies', 'contracts', 'freights', 'expenses', 'revenues']) {
    assert.match(
      schema,
      new RegExp(`create table if not exists ${table} \\([\\s\\S]*tenant_id uuid not null references tenants`, 'i')
    );
  }
});

test('schema protege unicidade critica de placa e CNPJ por tenant', () => {
  assert.match(schema, /create unique index if not exists idx_vehicles_tenant_plate/i);
  assert.match(schema, /create unique index if not exists idx_companies_tenant_cnpj/i);
});

test('schema registra auditoria nos recursos sensiveis', () => {
  for (const table of ['vehicles', 'providers', 'companies', 'contracts', 'freights', 'expenses', 'revenues']) {
    assert.match(
      schema,
      new RegExp(`create table if not exists ${table} \\([\\s\\S]*created_by_user_id uuid references users\\(id\\) on delete set null,[\\s\\S]*updated_by_user_id uuid references users\\(id\\) on delete set null`, 'i')
    );
  }
});

test('crud generico nao tenta inserir colunas ausentes no schema', () => {
  assert.doesNotMatch(appSource, /const columns = \['owner_uid'/i);
  assert.match(appSource, /const columns = \['tenant_id', 'created_by_user_id', 'updated_by_user_id'/i);
});

test('schema remove coluna legada owner_uid dos recursos operacionais', () => {
  for (const table of ['vehicles', 'providers', 'companies', 'contracts', 'freights', 'expenses']) {
    assert.match(
      schema,
      new RegExp(`alter table if exists ${table} drop column if exists owner_uid;`, 'i')
    );
  }
});
