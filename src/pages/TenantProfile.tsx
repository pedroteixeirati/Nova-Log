import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Loader2, MapPin, Save, ShieldCheck } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { tenantProfileApi } from '../lib/api';
import { canAccess } from '../lib/permissions';
import { TenantProfile } from '../types';

const emptyProfile: TenantProfile = {
  id: '',
  name: '',
  tradeName: '',
  slug: '',
  cnpj: '',
  stateRegistration: '',
  municipalRegistration: '',
  taxRegime: '',
  mainCnae: '',
  secondaryCnaes: '',
  openedAt: '',
  legalRepresentative: '',
  phone: '',
  whatsapp: '',
  email: '',
  financialEmail: '',
  fiscalEmail: '',
  website: '',
  zipCode: '',
  ibgeCode: '',
  addressLine: '',
  addressNumber: '',
  addressComplement: '',
  district: '',
  city: '',
  state: '',
  plan: 'starter',
  status: 'active',
};

export default function TenantProfilePage() {
  const { userProfile, refreshProfile } = useFirebase();
  const canUpdate = canAccess(userProfile, 'tenantProfile', 'update');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<TenantProfile>(emptyProfile);
  const [draft, setDraft] = useState<TenantProfile>(emptyProfile);

  const isDirty = useMemo(() => JSON.stringify(profile) !== JSON.stringify(draft), [profile, draft]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await tenantProfileApi.get();
        setProfile(data);
        setDraft(data);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: keyof TenantProfile, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canUpdate) return;

    setIsSubmitting(true);
    try {
      const updated = await tenantProfileApi.update({
        name: draft.name,
        tradeName: draft.tradeName,
        slug: draft.slug,
        cnpj: draft.cnpj,
        stateRegistration: draft.stateRegistration,
        municipalRegistration: draft.municipalRegistration,
        taxRegime: draft.taxRegime,
        mainCnae: draft.mainCnae,
        secondaryCnaes: draft.secondaryCnaes,
        openedAt: draft.openedAt,
        legalRepresentative: draft.legalRepresentative,
        phone: draft.phone,
        whatsapp: draft.whatsapp,
        email: draft.email,
        financialEmail: draft.financialEmail,
        fiscalEmail: draft.fiscalEmail,
        website: draft.website,
        zipCode: draft.zipCode,
        ibgeCode: draft.ibgeCode,
        addressLine: draft.addressLine,
        addressNumber: draft.addressNumber,
        addressComplement: draft.addressComplement,
        district: draft.district,
        city: draft.city,
        state: draft.state,
        plan: draft.plan,
        status: draft.status,
      });
      setProfile(updated);
      setDraft(updated);
      await refreshProfile();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDraft(profile);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="font-medium">Carregando perfil da transportadora...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Tenant profile</p>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Perfil da Transportadora</h1>
            <p className="mt-2 max-w-3xl text-on-surface-variant">
              Gerencie os dados institucionais, fiscais e de localizacao da transportadora cliente que opera neste ambiente.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || isSubmitting}
            className="rounded-full px-6 py-3 font-bold text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            Descartar
          </button>
          <button
            type="submit"
            form="tenant-profile-form"
            disabled={!canUpdate || !isDirty || isSubmitting}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Salvar alteracoes
          </button>
        </div>
      </header>

      <form id="tenant-profile-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
            <SectionTitle icon={Building2} title="Dados da Empresa" description="Base legal e tributaria da transportadora." />
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Razao social" value={draft.name} onChange={(value) => handleChange('name', value)} disabled={!canUpdate} />
              <Field label="Nome fantasia" value={draft.tradeName} onChange={(value) => handleChange('tradeName', value)} disabled={!canUpdate} />
              <Field label="CNPJ" value={draft.cnpj} onChange={(value) => handleChange('cnpj', value)} disabled={!canUpdate} />
              <Field label="Inscricao estadual" value={draft.stateRegistration} onChange={(value) => handleChange('stateRegistration', value)} disabled={!canUpdate} />
              <Field label="Inscricao municipal" value={draft.municipalRegistration} onChange={(value) => handleChange('municipalRegistration', value)} disabled={!canUpdate} />
              <Field label="Regime tributario" value={draft.taxRegime} onChange={(value) => handleChange('taxRegime', value)} disabled={!canUpdate} />
              <Field label="CNAE principal" value={draft.mainCnae} onChange={(value) => handleChange('mainCnae', value)} disabled={!canUpdate} />
              <Field label="Data de abertura" type="date" value={draft.openedAt} onChange={(value) => handleChange('openedAt', value)} disabled={!canUpdate} />
              <div className="md:col-span-2">
                <Field label="CNAEs secundarios" value={draft.secondaryCnaes} onChange={(value) => handleChange('secondaryCnaes', value)} disabled={!canUpdate} />
              </div>
              <Field label="Representante legal" value={draft.legalRepresentative} onChange={(value) => handleChange('legalRepresentative', value)} disabled={!canUpdate} />
              <Field label="Slug do tenant" value={draft.slug} onChange={(value) => handleChange('slug', value)} disabled={!canUpdate} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
            <SectionTitle icon={ShieldCheck} title="Comunicacao e Digital" description="Canais oficiais usados na operacao, fiscal e financeiro." />
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="E-mail principal" type="email" value={draft.email} onChange={(value) => handleChange('email', value)} disabled={!canUpdate} />
              <Field label="E-mail financeiro" type="email" value={draft.financialEmail} onChange={(value) => handleChange('financialEmail', value)} disabled={!canUpdate} />
              <Field label="E-mail fiscal" type="email" value={draft.fiscalEmail} onChange={(value) => handleChange('fiscalEmail', value)} disabled={!canUpdate} />
              <Field label="Telefone principal" value={draft.phone} onChange={(value) => handleChange('phone', value)} disabled={!canUpdate} />
              <Field label="WhatsApp" value={draft.whatsapp} onChange={(value) => handleChange('whatsapp', value)} disabled={!canUpdate} />
              <Field label="Site institucional" value={draft.website} onChange={(value) => handleChange('website', value)} disabled={!canUpdate} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
            <SectionTitle icon={MapPin} title="Endereco da Empresa" description="Dados para emissao fiscal e localizacao institucional." />
            <div className="mt-6 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(120,140,60,0.22),_transparent_55%),linear-gradient(135deg,rgba(140,154,93,0.18),rgba(26,28,21,0.02))] p-5">
              <div className="flex h-40 items-center justify-center rounded-[1.5rem] border border-white/40 bg-white/40 text-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Tenant</p>
                  <p className="mt-2 text-2xl font-black text-on-surface">{draft.tradeName || draft.name || 'Transportadora'}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{draft.city && draft.state ? `${draft.city} - ${draft.state}` : 'Perfil institucional da conta'}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="CEP" value={draft.zipCode} onChange={(value) => handleChange('zipCode', value)} disabled={!canUpdate} />
              <Field label="Codigo IBGE" value={draft.ibgeCode} onChange={(value) => handleChange('ibgeCode', value)} disabled={!canUpdate} />
              <div className="md:col-span-2">
                <Field label="Logradouro" value={draft.addressLine} onChange={(value) => handleChange('addressLine', value)} disabled={!canUpdate} />
              </div>
              <Field label="Numero" value={draft.addressNumber} onChange={(value) => handleChange('addressNumber', value)} disabled={!canUpdate} />
              <Field label="Complemento" value={draft.addressComplement} onChange={(value) => handleChange('addressComplement', value)} disabled={!canUpdate} />
              <div className="md:col-span-2">
                <Field label="Bairro" value={draft.district} onChange={(value) => handleChange('district', value)} disabled={!canUpdate} />
              </div>
              <Field label="Cidade" value={draft.city} onChange={(value) => handleChange('city', value)} disabled={!canUpdate} />
              <Field label="UF" value={draft.state} onChange={(value) => handleChange('state', value.toUpperCase())} disabled={!canUpdate} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
            <SectionTitle icon={ShieldCheck} title="Conta SaaS" description="Informacoes operacionais do tenant dentro da plataforma." />
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Plano" value={draft.plan} onChange={(value) => handleChange('plan', value)} disabled={!canUpdate} />
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status da conta</label>
                <select
                  value={draft.status}
                  onChange={(event) => handleChange('status', event.target.value)}
                  disabled={!canUpdate}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                  <option value="suspended">Suspensa</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-1 rounded-full bg-primary" />
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-on-surface">{title}</h2>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">{description}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
