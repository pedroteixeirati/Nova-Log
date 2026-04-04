import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  addMonths,
  formatCompetenceLabel,
  formatDueDate,
  monthDiff,
  parseDateInput,
  shouldGenerateContractRevenue,
  startOfMonth,
} from '../domain/revenues.ts';

const appSource = readFileSync(resolve(process.cwd(), 'server/app.ts'), 'utf8');

test('gera receitas automaticas apenas para contratos recorrentes com valor mensal positivo', () => {
  assert.equal(shouldGenerateContractRevenue('recurring', 18000), true);
  assert.equal(shouldGenerateContractRevenue('recurring', 0), false);
  assert.equal(shouldGenerateContractRevenue('per_trip', 18000), false);
});

test('calcula intervalo mensal corretamente para competencias', () => {
  const start = startOfMonth(new Date('2026-01-15T00:00:00'));
  const end = startOfMonth(new Date('2026-04-01T00:00:00'));

  assert.equal(monthDiff(start, end), 3);
  assert.equal(addMonths(start, 2).toISOString().slice(0, 10), '2026-03-01');
});

test('gera vencimento limitado ao ultimo dia do mes', () => {
  const reference = new Date('2026-02-01T00:00:00');
  const startDate = parseDateInput('2026-01-31');

  assert.equal(formatDueDate(reference, startDate), '2026-02-28');
});

test('gera rotulo de competencia em portugues', () => {
  const label = formatCompetenceLabel(new Date('2026-04-01T00:00:00'));
  assert.match(label, /abril/i);
  assert.match(label, /2026/);
});

test('nao apaga historico de receitas ao interromper geracao recorrente', () => {
  assert.doesNotMatch(
    appSource,
    /delete from revenues[\s\S]*contract_id = \$2[\s\S]*source_type = 'contract'/i
  );
});

test('insert de receitas inclui colunas de auditoria compativeis com os valores enviados', () => {
  assert.match(
    appSource,
    /insert into revenues \([\s\S]*source_type,\s*created_by_user_id,\s*updated_by_user_id[\s\S]*values \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, 'pending', 'contract', \$12, \$12\)/i
  );
});
