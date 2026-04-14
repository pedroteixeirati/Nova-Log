import { Freight } from '../types/freight.types';

export function formatFreightSegment(
  freightLike: Pick<Freight, 'origin' | 'destination'> | { origin?: string; destination?: string },
) {
  const origin = freightLike.origin?.trim();
  const destination = freightLike.destination?.trim();

  if (origin && destination) {
    return `${origin} x ${destination}`;
  }

  return '-';
}
