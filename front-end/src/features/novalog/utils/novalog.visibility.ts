import { UserProfile } from '../../../shared/types/common.types';

export function canAccessNovalogOperations(profile: UserProfile | null) {
  if (!profile) return false;
  return profile.role === 'dev' || profile.tenantSlug === 'novalog';
}
