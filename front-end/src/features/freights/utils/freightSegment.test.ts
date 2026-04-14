import { describe, expect, it } from 'vitest';
import { formatFreightSegment } from './freightSegment';

describe('formatFreightSegment', () => {
  it('monta o trecho com origem e destino', () => {
    expect(
      formatFreightSegment({
        origin: 'Sete Lagoas/MG',
        destination: 'Diamantina/MG',
      }),
    ).toBe('Sete Lagoas/MG x Diamantina/MG');
  });

  it('retorna placeholder quando faltarem origem e destino', () => {
    expect(
      formatFreightSegment({
        origin: '',
        destination: '',
      }),
    ).toBe('-');
  });
});
