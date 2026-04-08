export interface PlatformTenant {
  id: string;
  displayId?: number;
  name: string;
  tradeName: string;
  slug: string;
  cnpj: string;
  city: string;
  state: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  legalRepresentative?: string;
  ownerName: string;
  ownerEmail: string;
  ownerLinked: boolean;
  createdAt: string;
  updatedAt?: string;
  createdByName?: string;
  updatedByName?: string;
}
