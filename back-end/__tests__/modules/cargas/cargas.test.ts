import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cargosServiceSource = readFileSync(resolve(process.cwd(), 'back-end/modules/cargas/services/cargas.service.ts'), 'utf8');
const cargosErrorsSource = readFileSync(resolve(process.cwd(), 'back-end/modules/cargas/errors/cargas.errors.ts'), 'utf8');
const cargosResourceSource = readFileSync(resolve(process.cwd(), 'back-end/modules/cargas/cargas.resource.ts'), 'utf8');
const cargosRepositorySource = readFileSync(resolve(process.cwd(), 'back-end/modules/cargas/repositories/cargas.repository.ts'), 'utf8');

test('validacao de cargas rejeita identificadores invalidos com code e field consistentes', () => {
  assert.match(cargosServiceSource, /if \(!isValidUuid\(freightId\)\) throw cargoErrors\.invalidFreight\(\);/);
  assert.match(cargosServiceSource, /if \(!isValidUuid\(companyId\)\) throw cargoErrors\.invalidCompany\(\);/);
  assert.match(cargosErrorsSource, /new AppError\('Selecione um frete valido para a carga\.', \{ code: 'invalid_cargo_freight', field: 'freightId' \}\)/);
});

test('servico de cargas normaliza payload e leva origem\/destino do frete vinculado', () => {
  assert.match(cargosServiceSource, /const freightId = normalizeRequiredText\(body\.freightId\);/);
  assert.match(cargosServiceSource, /const companyId = normalizeRequiredText\(body\.companyId\);/);
  assert.match(cargosServiceSource, /const weight = body\.weight === ''[\s\S]*Number\(body\.weight\);/);
  assert.match(cargosServiceSource, /if \(!isValidUuid\(freightId\)\) throw cargoErrors\.invalidFreight\(\);/);
  assert.match(cargosServiceSource, /const freight = await findTenantFreightForCargo\(freightId, tenantId\);/);
  assert.match(cargosServiceSource, /freightOrigin: freight\.origin,/);
  assert.match(cargosServiceSource, /freightDestination: freight\.destination,/);
  assert.doesNotMatch(cargosServiceSource, /freightRoute/);
  assert.match(cargosServiceSource, /const company = await findTenantCompanyForCargo\(companyId, tenantId\);/);
  assert.match(cargosServiceSource, /companyName: company\.trade_name \|\| company\.corporate_name,/);
});

test('repositorio de cargas consulta frete com origem e destino no mesmo tenant e lista por freight_id', () => {
  assert.match(cargosRepositorySource, /select id, display_id, origin, destination[\s\S]*from freights[\s\S]*where id = \$1[\s\S]*tenant_id = \$2/i);
  assert.match(cargosRepositorySource, /from companies[\s\S]*where id = \$1[\s\S]*tenant_id = \$2/i);
  assert.match(cargosRepositorySource, /select id, display_id, tenant_id, freight_id, freight_display_id, freight_origin, freight_destination[\s\S]*from cargas[\s\S]*where freight_id = \$1[\s\S]*tenant_id = \$2/i);
});

test('resource de cargas expoe campos operacionais, comerciais e trecho do frete para o front', () => {
  assert.match(cargosResourceSource, /\{ api: 'freightId', db: 'freight_id' \}/);
  assert.match(cargosResourceSource, /\{ api: 'freightOrigin', db: 'freight_origin' \}/);
  assert.match(cargosResourceSource, /\{ api: 'freightDestination', db: 'freight_destination' \}/);
  assert.doesNotMatch(cargosResourceSource, /freightRoute/);
  assert.match(cargosResourceSource, /\{ api: 'companyName', db: 'company_name' \}/);
  assert.match(cargosResourceSource, /\{ api: 'cargoType', db: 'cargo_type' \}/);
  assert.match(cargosResourceSource, /\{ api: 'merchandiseValue', db: 'merchandise_value', type: 'number' \}/);
  assert.match(cargosResourceSource, /\{ api: 'scheduledDate', db: 'scheduled_date' \}/);
});
