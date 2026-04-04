import test from 'node:test';
import assert from 'node:assert/strict';
import { canPerform } from '../permissions.ts';
import { resources } from '../resources.ts';

test('viewer nao pode criar, editar ou excluir recursos operacionais', () => {
  for (const resource of Object.values(resources)) {
    assert.equal(canPerform('create', resource.permissions, 'viewer'), false);
    assert.equal(canPerform('update', resource.permissions, 'viewer'), false);
    assert.equal(canPerform('delete', resource.permissions, 'viewer'), false);
  }
});

test('driver so pode criar e editar fretes entre os recursos operacionais', () => {
  assert.equal(canPerform('create', resources.freights.permissions, 'driver'), true);
  assert.equal(canPerform('update', resources.freights.permissions, 'driver'), true);
  assert.equal(canPerform('delete', resources.freights.permissions, 'driver'), false);

  assert.equal(canPerform('create', resources.vehicles.permissions, 'driver'), false);
  assert.equal(canPerform('create', resources.expenses.permissions, 'driver'), false);
  assert.equal(canPerform('create', resources.contracts.permissions, 'driver'), false);
});

test('financeiro pode operar despesas, mas nao pode alterar veiculos', () => {
  assert.equal(canPerform('create', resources.expenses.permissions, 'financial'), true);
  assert.equal(canPerform('update', resources.expenses.permissions, 'financial'), true);
  assert.equal(canPerform('delete', resources.expenses.permissions, 'financial'), true);

  assert.equal(canPerform('create', resources.vehicles.permissions, 'financial'), false);
  assert.equal(canPerform('update', resources.vehicles.permissions, 'financial'), false);
});
