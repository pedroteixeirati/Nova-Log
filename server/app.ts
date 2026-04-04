import cors from 'cors';
import express from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { pool } from './db';
import { adminAuth } from './firebaseAdmin';
import { addMonths, formatCompetenceLabel, formatDateLabel, formatDueDate, monthDiff, parseDateInput, shouldGenerateContractRevenue, startOfMonth } from './domain/revenues';
import {
  isNonNegativeNumber,
  isPositiveNumber,
  isValidCnpj,
  isValidCpf,
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidPlan,
  isValidPlate,
  isValidSlug,
  isValidState,
  isValidTenantStatus,
  isValidTime,
  isValidUuid,
  normalizeCnpj,
  normalizeCpf,
  normalizeOptionalEmail,
  normalizeOptionalText,
  normalizePhone,
  normalizePlate,
  normalizeRequiredText,
  slugify,
} from './domain/validation';
import { canPerform, type AppRole, platformTenantRoles, tenantProfileRoles, userManagementRoles } from './permissions';
import { resources } from './resources';

type AuthenticatedRequest = express.Request & {
  auth?: {
    uid: string;
    userId: string;
    email: string;
    name?: string;
    role: AppRole;
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
  };
};

type AppUserRow = {
  id: string;
  firebase_uid: string;
  email: string;
  role: AppRole;
  name: string | null;
  status: string;
  created_at: string;
};

type TenantProfileRow = {
  id: string;
  name: string;
  trade_name: string | null;
  slug: string;
  cnpj: string | null;
  state_registration: string | null;
  municipal_registration: string | null;
  tax_regime: string | null;
  main_cnae: string | null;
  secondary_cnaes: string | null;
  opened_at: string | null;
  legal_representative: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  financial_email: string | null;
  fiscal_email: string | null;
  website: string | null;
  zip_code: string | null;
  ibge_code: string | null;
  address_line: string | null;
  address_number: string | null;
  address_complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  updated_by_name: string | null;
};

type PlatformTenantRow = {
  id: string;
  name: string;
  trade_name: string | null;
  slug: string;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  legal_representative: string | null;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  updated_by_name: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_linked: boolean;
};

type RevenueRow = {
  id: string;
  company_id: string | null;
  company_name: string | null;
  contract_id: string | null;
  contract_name: string | null;
  freight_id: string | null;
  competence_month: number;
  competence_year: number;
  competence_label: string;
  description: string;
  amount: string | number;
  due_date: string;
  status: 'pending' | 'billed' | 'received' | 'overdue' | 'canceled';
  source_type: 'contract' | 'freight' | 'manual';
  charge_reference: string | null;
  charge_generated_at: string | null;
  received_at: string | null;
  created_at: string;
};

type ContractRevenueSeedRow = {
  id: string;
  company_id: string;
  company_name: string;
  contract_name: string;
  remuneration_type: 'recurring' | 'per_trip';
  monthly_value: string | number;
  start_date: string;
  end_date: string;
  status: 'active' | 'renewal' | 'closed';
};

type FreightRevenueSeedRow = {
  id: string;
  plate: string;
  date: string;
  route: string;
  amount: string | number;
};

const app = express();

app.use(cors());
app.use(express.json());

function canManageTenantUsers(role?: AppRole) {
  return !!role && userManagementRoles.includes(role);
}

function canManageTenantProfile(role?: AppRole) {
  return !!role && tenantProfileRoles.includes(role);
}

function canManagePlatformTenants(role?: AppRole) {
  return !!role && platformTenantRoles.includes(role);
}

function ensureAllowed(res: express.Response, allowed: boolean, message: string) {
  if (!allowed) {
    res.status(403).json({ error: message });
    return false;
  }
  return true;
}

function defaultTenantName(token: DecodedIdToken) {
  const base = token.name?.trim() || token.email?.split('@')[0] || 'Transportadora';
  return `${base} Transportes`;
}

function tenantSlugFor(token: DecodedIdToken) {
  const base = slugify(token.email?.split('@')[0] || token.name || 'transportadora') || 'transportadora';
  return `${base}-${token.uid.slice(0, 6)}`;
}

function mapRow<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  fields: { api: string; db: string; type?: 'number' }[]
) {
  const mapped: Record<string, unknown> = { id: row.id };
  for (const field of fields) {
    const value = row[field.db];
    mapped[field.api] = field.type === 'number' && value !== null && value !== undefined
      ? Number(value)
      : value;
  }
  return mapped as T;
}

function mapTenantProfile(row: TenantProfileRow) {
  return {
    id: row.id,
    name: row.name,
    tradeName: row.trade_name || '',
    slug: row.slug,
    cnpj: row.cnpj || '',
    stateRegistration: row.state_registration || '',
    municipalRegistration: row.municipal_registration || '',
    taxRegime: row.tax_regime || '',
    mainCnae: row.main_cnae || '',
    secondaryCnaes: row.secondary_cnaes || '',
    openedAt: row.opened_at || '',
    legalRepresentative: row.legal_representative || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    financialEmail: row.financial_email || '',
    fiscalEmail: row.fiscal_email || '',
    website: row.website || '',
    zipCode: row.zip_code || '',
    ibgeCode: row.ibge_code || '',
    addressLine: row.address_line || '',
    addressNumber: row.address_number || '',
    addressComplement: row.address_complement || '',
    district: row.district || '',
    city: row.city || '',
    state: row.state || '',
    plan: row.plan,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByName: row.created_by_name || '',
    updatedByName: row.updated_by_name || '',
  };
}

function mapPlatformTenant(row: PlatformTenantRow) {
  return {
    id: row.id,
    name: row.name,
    tradeName: row.trade_name || '',
    slug: row.slug,
    cnpj: row.cnpj || '',
    city: row.city || '',
    state: row.state || '',
    phone: row.phone || '',
    legalRepresentative: row.legal_representative || '',
    plan: row.plan,
    status: row.status,
    ownerName: row.owner_name || '',
    ownerEmail: row.owner_email || '',
    ownerLinked: row.owner_linked,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByName: row.created_by_name || '',
    updatedByName: row.updated_by_name || '',
  };
}

function mapRevenue(row: RevenueRow) {
  return {
    id: row.id,
    companyId: row.company_id || '',
    companyName: row.company_name || 'Fretes avulsos',
    contractId: row.contract_id || '',
    contractName: row.contract_name || 'Frete avulso',
    freightId: row.freight_id || undefined,
    competenceMonth: row.competence_month,
    competenceYear: row.competence_year,
    competenceLabel: row.competence_label,
    description: row.description,
    amount: Number(row.amount || 0),
    dueDate: row.due_date,
    status: row.status,
    sourceType: row.source_type,
    chargeReference: row.charge_reference || undefined,
    chargeGeneratedAt: row.charge_generated_at || undefined,
    receivedAt: row.received_at || undefined,
    createdAt: row.created_at,
  };
}

async function generateMonthlyRevenuesForTenant(tenantId?: string, actorUserId?: string) {
  if (!tenantId) return 0;

  const contractsResult = await pool.query<ContractRevenueSeedRow>(
      `select id,
            company_id,
            company_name,
            contract_name,
            remuneration_type,
            monthly_value,
            start_date,
            end_date,
            status
     from contracts
     where tenant_id = $1
       and status in ('active', 'renewal')`,
    [tenantId]
  );

  let generated = 0;
  const currentMonth = startOfMonth(new Date());

  for (const contract of contractsResult.rows) {
    if (!shouldGenerateContractRevenue(contract.remuneration_type, Number(contract.monthly_value || 0))) {
      continue;
    }

    const startDate = parseDateInput(contract.start_date);
    const endDate = parseDateInput(contract.end_date);

    if (!startDate) continue;

    const startMonth = startOfMonth(startDate);
    const lastMonth = endDate ? startOfMonth(endDate) : currentMonth;
    const generationLimit = lastMonth < currentMonth ? lastMonth : currentMonth;
    const totalMonths = monthDiff(startMonth, generationLimit);

    if (totalMonths < 0) continue;

    for (let offset = 0; offset <= totalMonths; offset += 1) {
      const competenceDate = addMonths(startMonth, offset);

      const insertResult = await pool.query(
        `insert into revenues (
           tenant_id,
           company_id,
           company_name,
           contract_id,
           contract_name,
           competence_month,
           competence_year,
           competence_label,
           description,
           amount,
           due_date,
           status,
           source_type,
           created_by_user_id,
           updated_by_user_id
          )
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', 'contract', $12, $12)
         on conflict (tenant_id, contract_id, competence_month, competence_year) do update set
           company_id = excluded.company_id,
           company_name = excluded.company_name,
           contract_name = excluded.contract_name,
           competence_label = excluded.competence_label,
           description = excluded.description,
           amount = excluded.amount,
           due_date = excluded.due_date,
           updated_by_user_id = excluded.updated_by_user_id,
           updated_at = now()`,
        [
          tenantId,
          contract.company_id,
          contract.company_name,
          contract.id,
          contract.contract_name,
          competenceDate.getMonth() + 1,
          competenceDate.getFullYear(),
          formatCompetenceLabel(competenceDate),
          `Repasse mensal do contrato ${contract.contract_name}`,
          Number(contract.monthly_value || 0),
          formatDueDate(competenceDate, startDate),
          actorUserId || null,
        ]
      );

      generated += insertResult.rowCount || 0;
    }
  }
  return generated;
}

async function syncFreightRevenue(tenantId: string | undefined, freight: FreightRevenueSeedRow, actorUserId?: string) {
  if (!tenantId) return;

  const freightDate = parseDateInput(freight.date);
  if (!freightDate) return;

  await pool.query(
     `insert into revenues (
       tenant_id,
       company_name,
       contract_name,
       freight_id,
       competence_month,
       competence_year,
       competence_label,
       description,
       amount,
       due_date,
       status,
       source_type,
       created_by_user_id,
       updated_by_user_id
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'received', 'freight', $11, $12)
     on conflict (freight_id) where freight_id is not null
     do update set
       company_name = excluded.company_name,
       contract_name = excluded.contract_name,
       competence_month = excluded.competence_month,
       competence_year = excluded.competence_year,
       competence_label = excluded.competence_label,
       description = excluded.description,
       amount = excluded.amount,
       due_date = excluded.due_date,
       updated_by_user_id = excluded.updated_by_user_id,
       updated_at = now()`,
    [
      tenantId,
      'Fretes avulsos',
      freight.route,
      freight.id,
      freightDate.getMonth() + 1,
      freightDate.getFullYear(),
      formatCompetenceLabel(freightDate),
      `Frete avulso ${freight.plate} - ${freight.route}`,
      Number(freight.amount || 0),
      freight.date,
      actorUserId || null,
      actorUserId || null,
    ]
  );
}

async function syncFreightRevenuesForTenant(tenantId?: string, actorUserId?: string) {
  if (!tenantId) return 0;

  const freightsResult = await pool.query<FreightRevenueSeedRow>(
    `select id, plate, date, route, amount
     from freights
     where tenant_id = $1`,
    [tenantId]
  );

  for (const freight of freightsResult.rows) {
    await syncFreightRevenue(tenantId, freight, actorUserId);
  }

  return freightsResult.rows.length;
}

async function ensureUser(decoded: DecodedIdToken) {
  const existing = await pool.query<AppUserRow>(
    `select id, firebase_uid, email, role, name, status, created_at
     from users
     where firebase_uid = $1
     limit 1`,
    [decoded.uid]
  );

  if (existing.rows[0]) {
    const current = existing.rows[0];
    const normalizedEmail = decoded.email || current.email;
    const normalizedName = decoded.name || current.name;

    if (normalizedEmail !== current.email || normalizedName !== current.name) {
      const updated = await pool.query<AppUserRow>(
        `update users
         set email = $1,
             name = $2,
             updated_at = now()
         where id = $3
         returning id, firebase_uid, email, role, name, status, created_at`,
        [normalizedEmail, normalizedName, current.id]
      );
      return updated.rows[0];
    }

    return current;
  }

  const created = await pool.query<AppUserRow>(
    `insert into users (firebase_uid, email, role, name, status)
     values ($1, $2, $3, $4, 'active')
     returning id, firebase_uid, email, role, name, status, created_at`,
    [decoded.uid, decoded.email || '', 'viewer', decoded.name || null]
  );

  return created.rows[0];
}

async function ensureTenantContext(user: AppUserRow) {
  const existingMembership = await pool.query<{
    tenant_id: string;
    tenant_name: string;
    tenant_slug: string;
    role: AppRole;
  }>(
    `select tu.tenant_id,
            t.name as tenant_name,
            t.slug as tenant_slug,
            tu.role
     from tenant_users tu
     inner join tenants t on t.id = tu.tenant_id
     where tu.user_id = $1
     order by tu.created_at asc
     limit 1`,
    [user.id]
  );

  if (existingMembership.rows[0]) {
    return existingMembership.rows[0];
  }

  return null;
}

async function loadAuthContext(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autenticacao ausente.' });
      return;
    }

    const decoded = await adminAuth.verifyIdToken(header.replace('Bearer ', ''));
    const user = await ensureUser(decoded);
    const membership = await ensureTenantContext(user);

    if (!membership) {
      res.status(403).json({ error: 'Usuario autenticado sem vinculacao a uma transportadora ativa. Solicite acesso ao administrador da plataforma.' });
      return;
    }

    req.auth = {
      uid: decoded.uid,
      userId: user.id,
      email: user.email,
      name: user.name || decoded.name,
      role: membership.role,
      tenantId: membership.tenant_id,
      tenantName: membership.tenant_name,
      tenantSlug: membership.tenant_slug,
    };

    next();
  } catch (error) {
    next(error);
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/me/profile', loadAuthContext, async (req: AuthenticatedRequest, res) => {
  const auth = req.auth!;

  res.json({
    uid: auth.uid,
    email: auth.email,
    role: auth.role,
    name: auth.name,
    tenantId: auth.tenantId,
    tenantName: auth.tenantName,
    tenantSlug: auth.tenantSlug,
  });
});

app.get('/api/tenant-profile', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canManageTenantProfile(req.auth?.role), 'Sem permissao para visualizar o perfil da transportadora.')) {
      return;
    }

    const result = await pool.query<TenantProfileRow>(
      `select t.id,
              t.name,
              t.trade_name,
              t.slug,
              t.cnpj,
              t.state_registration,
              t.municipal_registration,
              t.tax_regime,
              t.main_cnae,
              t.secondary_cnaes,
              t.opened_at,
              t.legal_representative,
              t.phone,
              t.whatsapp,
              t.email,
              t.financial_email,
              t.fiscal_email,
              t.website,
              t.zip_code,
              t.ibge_code,
              t.address_line,
              t.address_number,
              t.address_complement,
              t.district,
              t.city,
              t.state,
              t.plan,
              t.status,
              t.created_at,
              t.updated_at,
              coalesce(created_by_user.name, '') as created_by_name,
              coalesce(updated_by_user.name, '') as updated_by_name
       from tenants t
       left join users created_by_user on created_by_user.id = t.created_by_user_id
       left join users updated_by_user on updated_by_user.id = t.updated_by_user_id
       where t.id = $1
       limit 1`,
      [req.auth?.tenantId]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Transportadora nao encontrada.' });
      return;
    }

    res.json(mapTenantProfile(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

app.put('/api/tenant-profile', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canManageTenantProfile(req.auth?.role), 'Sem permissao para editar o perfil da transportadora.')) {
      return;
    }

    const {
      name,
      tradeName,
      slug,
      cnpj,
      stateRegistration,
      municipalRegistration,
      taxRegime,
      mainCnae,
      secondaryCnaes,
      openedAt,
      legalRepresentative,
      phone,
      whatsapp,
      email,
      financialEmail,
      fiscalEmail,
      website,
      zipCode,
      ibgeCode,
      addressLine,
      addressNumber,
      addressComplement,
      district,
      city,
      state,
      plan,
      status,
    } = req.body as Record<string, string>;

    const normalizedName = normalizeRequiredText(name) || req.auth?.tenantName || 'Transportadora';
    const normalizedTradeName = normalizeOptionalText(tradeName);
    const normalizedSlug = slugify(slug || normalizedTradeName || normalizedName || req.auth?.tenantSlug || 'transportadora') || req.auth?.tenantSlug || 'transportadora';
    const normalizedCnpj = normalizeCnpj(cnpj);
    const normalizedState = normalizeOptionalText(state)?.toUpperCase() || null;
    const normalizedPhone = normalizePhone(phone);
    const normalizedWhatsapp = normalizePhone(whatsapp);
    const normalizedPrimaryEmail = normalizeOptionalEmail(email);
    const normalizedFinancialEmail = normalizeOptionalEmail(financialEmail);
    const normalizedFiscalEmail = normalizeOptionalEmail(fiscalEmail);
    const canManageBilling = req.auth?.role === 'dev';
    const nextPlan = canManageBilling ? (plan || 'starter') : null;
    const nextStatus = canManageBilling ? (status || 'active') : null;

    if (normalizedName.length < 3 || normalizedName.length > 120) {
      res.status(400).json({ error: 'A razao social deve ter entre 3 e 120 caracteres.' });
      return;
    }

    if (normalizedTradeName && normalizedTradeName.length > 120) {
      res.status(400).json({ error: 'O nome fantasia deve ter no maximo 120 caracteres.' });
      return;
    }

    if (!isValidSlug(normalizedSlug)) {
      res.status(400).json({ error: 'O slug informado e invalido. Use apenas letras minusculas, numeros e hifens.' });
      return;
    }

    if (normalizedCnpj && !isValidCnpj(normalizedCnpj)) {
      res.status(400).json({ error: 'Informe um CNPJ valido para a transportadora.' });
      return;
    }

    if (!isValidState(normalizedState)) {
      res.status(400).json({ error: 'A UF deve conter exatamente 2 letras.' });
      return;
    }

    if (!isValidPlan(nextPlan) || !isValidTenantStatus(nextStatus)) {
      res.status(400).json({ error: 'Plano ou status da transportadora invalido.' });
      return;
    }

    if (!isValidPhone(normalizedPhone) || !isValidPhone(normalizedWhatsapp)) {
      res.status(400).json({ error: 'Telefone e WhatsApp devem conter DDD e numero valido.' });
      return;
    }

    if (!isValidPlan(plan) || !isValidTenantStatus(status)) {
      res.status(400).json({ error: 'Plano ou status da transportadora invalido.' });
      return;
    }

    for (const tenantEmail of [normalizedPrimaryEmail, normalizedFinancialEmail, normalizedFiscalEmail]) {
      if (tenantEmail && !isValidEmail(tenantEmail)) {
        res.status(400).json({ error: 'Um dos e-mails informados para a transportadora e invalido.' });
        return;
      }
    }

    const duplicateTenant = await pool.query<{ id: string }>(
      `select id
       from tenants
       where id <> $1
         and (
           slug = $2
           or ($3 <> '' and regexp_replace(coalesce(cnpj, ''), '\D', '', 'g') = $3)
         )
       limit 1`,
      [req.auth?.tenantId, normalizedSlug, normalizedCnpj]
    );

    if (duplicateTenant.rows[0]) {
      res.status(409).json({ error: normalizedCnpj ? 'Ja existe outra transportadora com esse slug ou CNPJ.' : 'Ja existe outra transportadora com esse slug.' });
      return;
    }

    const result = await pool.query<TenantProfileRow>(
      `update tenants
       set name = $1,
           trade_name = $2,
           slug = $3,
           cnpj = $4,
           state_registration = $5,
           municipal_registration = $6,
           tax_regime = $7,
           main_cnae = $8,
           secondary_cnaes = $9,
           opened_at = $10,
           legal_representative = $11,
           phone = $12,
           whatsapp = $13,
           email = $14,
           financial_email = $15,
           fiscal_email = $16,
           website = $17,
           zip_code = $18,
           ibge_code = $19,
           address_line = $20,
           address_number = $21,
           address_complement = $22,
           district = $23,
           city = $24,
           state = $25,
           plan = coalesce($26, plan),
           status = coalesce($27, status),
           updated_by_user_id = $28,
           updated_at = now()
       where id = $29
       returning id,
                 name,
                 trade_name,
                 slug,
                 cnpj,
                 state_registration,
                 municipal_registration,
                 tax_regime,
                 main_cnae,
                 secondary_cnaes,
                 opened_at,
                 legal_representative,
                 phone,
                 whatsapp,
                 email,
                 financial_email,
                 fiscal_email,
                 website,
                 zip_code,
                 ibge_code,
                 address_line,
                 address_number,
                 address_complement,
                 district,
                 city,
                 state,
                 plan,
                 status,
                 created_at,
                 updated_at,
                 (
                   select coalesce(u.name, '')
                   from users u
                   where u.id = created_by_user_id
                 ) as created_by_name,
                 (
                   select coalesce(u.name, '')
                   from users u
                   where u.id = updated_by_user_id
                 ) as updated_by_name`,
      [
        normalizedName,
        normalizedTradeName,
        normalizedSlug,
        normalizedCnpj || null,
        normalizeOptionalText(stateRegistration),
        normalizeOptionalText(municipalRegistration),
        normalizeOptionalText(taxRegime),
        normalizeOptionalText(mainCnae),
        normalizeOptionalText(secondaryCnaes),
        normalizeOptionalText(openedAt),
        normalizeOptionalText(legalRepresentative),
        normalizedPhone || null,
        normalizedWhatsapp || null,
        normalizedPrimaryEmail,
        normalizedFinancialEmail,
        normalizedFiscalEmail,
        normalizeOptionalText(website),
        normalizeOptionalText(zipCode),
        normalizeOptionalText(ibgeCode),
        normalizeOptionalText(addressLine),
        normalizeOptionalText(addressNumber),
        normalizeOptionalText(addressComplement),
        normalizeOptionalText(district),
        normalizeOptionalText(city),
        normalizedState,
        nextPlan,
        nextStatus,
        req.auth?.userId,
        req.auth?.tenantId,
      ]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Transportadora nao encontrada.' });
      return;
    }

    res.json(mapTenantProfile(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

app.get('/api/platform/tenants', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canManagePlatformTenants(req.auth?.role), 'Sem permissao para visualizar transportadoras da plataforma.')) {
      return;
    }

    const result = await pool.query<PlatformTenantRow>(
      `select t.id,
              t.name,
              t.trade_name,
              t.slug,
              t.cnpj,
              t.city,
              t.state,
              t.phone,
              t.legal_representative,
              t.plan,
              t.status,
              t.created_at,
              t.updated_at,
              coalesce(created_by_user.name, '') as created_by_name,
              coalesce(updated_by_user.name, '') as updated_by_name,
              coalesce(u.name, '') as owner_name,
              coalesce(u.email, '') as owner_email,
              (u.id is not null) as owner_linked
       from tenants t
       left join users created_by_user on created_by_user.id = t.created_by_user_id
       left join users updated_by_user on updated_by_user.id = t.updated_by_user_id
       left join lateral (
         select tu.user_id
         from tenant_users tu
         where tu.tenant_id = t.id
           and tu.role = 'owner'
         order by tu.created_at asc
         limit 1
       ) tenant_owner on true
       left join users u on u.id = tenant_owner.user_id
       order by t.created_at desc`
    );

    res.json(result.rows.map(mapPlatformTenant));
  } catch (error) {
    next(error);
  }
});

app.post('/api/platform/tenants', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  const client = await pool.connect();
  let createdFirebaseUid: string | null = null;
  let transactionStarted = false;

  try {
    if (!ensureAllowed(res, canManagePlatformTenants(req.auth?.role), 'Sem permissao para criar transportadoras.')) {
      return;
    }

    const {
      name,
      tradeName,
      slug,
      cnpj,
      phone,
      legalRepresentative,
      city,
      state,
      plan,
      status,
      ownerEmail,
      ownerName,
      ownerPassword,
    } = req.body as {
      name: string;
      tradeName?: string;
      slug?: string;
      cnpj?: string;
      phone?: string;
      legalRepresentative?: string;
      city?: string;
      state?: string;
      plan?: string;
      status?: 'active' | 'inactive' | 'suspended';
      ownerEmail: string;
      ownerName?: string;
      ownerPassword: string;
    };

    const normalizedName = normalizeRequiredText(name);
    const normalizedTradeName = normalizeOptionalText(tradeName);
    const normalizedCity = normalizeOptionalText(city);
    const normalizedState = normalizeOptionalText(state)?.toUpperCase() || null;
    const normalizedPhone = normalizePhone(phone);
    const normalizedLegalRepresentative = normalizeOptionalText(legalRepresentative);
    const normalizedOwnerEmail = normalizeRequiredText(ownerEmail).toLowerCase();
    const normalizedOwnerName = normalizeRequiredText(ownerName);
    const normalizedPassword = ownerPassword || '';
    const normalizedCnpj = normalizeCnpj(cnpj);
    const normalizedSlug = slugify(slug || tradeName || name) || `tenant-${Date.now()}`;

    if (!normalizedName || !normalizedOwnerEmail || !normalizedOwnerName || !normalizedPassword) {
      res.status(400).json({ error: 'Razao social, nome do owner, e-mail do owner e senha inicial sao obrigatorios.' });
      return;
    }

    if (normalizedName.length < 3 || normalizedName.length > 120) {
      res.status(400).json({ error: 'A razao social deve ter entre 3 e 120 caracteres.' });
      return;
    }

    if (normalizedTradeName && normalizedTradeName.length > 120) {
      res.status(400).json({ error: 'O nome fantasia deve ter no maximo 120 caracteres.' });
      return;
    }

    if (!isValidEmail(normalizedOwnerEmail)) {
      res.status(400).json({ error: 'Informe um e-mail valido para o owner.' });
      return;
    }

    if (normalizedPassword.length < 6) {
      res.status(400).json({ error: 'A senha inicial do owner deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (!isValidState(normalizedState)) {
      res.status(400).json({ error: 'A UF deve conter exatamente 2 letras.' });
      return;
    }

    if (!isValidPhone(normalizedPhone)) {
      res.status(400).json({ error: 'Informe um telefone principal valido com DDD.' });
      return;
    }

    if (!isValidSlug(normalizedSlug)) {
      res.status(400).json({ error: 'O slug informado e invalido. Use apenas letras minusculas, numeros e hifens.' });
      return;
    }

    if (normalizedCnpj && !isValidCnpj(normalizedCnpj)) {
      res.status(400).json({ error: 'Informe um CNPJ valido para a transportadora.' });
      return;
    }

    const duplicateTenant = await client.query<{ id: string }>(
      `select id
       from tenants
       where slug = $1
          or ($2 <> '' and regexp_replace(coalesce(cnpj, ''), '\D', '', 'g') = $2)
       limit 1`,
      [normalizedSlug, normalizedCnpj]
    );

    if (duplicateTenant.rows[0]) {
      res.status(409).json({ error: normalizedCnpj ? 'Ja existe uma transportadora cadastrada com esse slug ou CNPJ.' : 'Ja existe uma transportadora cadastrada com esse slug.' });
      return;
    }

    const duplicateUser = await client.query<{ id: string }>(
      `select id
       from users
       where lower(email) = $1
       limit 1`,
      [normalizedOwnerEmail]
    );

    if (duplicateUser.rows[0]) {
      res.status(409).json({ error: 'Ja existe um usuario cadastrado com esse e-mail.' });
      return;
    }

    let firebaseUser;
    try {
      firebaseUser = await adminAuth.createUser({
        email: normalizedOwnerEmail,
        password: normalizedPassword,
        displayName: normalizedOwnerName,
      });
      createdFirebaseUid = firebaseUser.uid;
    } catch (firebaseError: any) {
      const code = firebaseError?.code || '';
      if (code.includes('email-already-exists')) {
        res.status(409).json({ error: 'Ja existe um usuario no Firebase com esse e-mail.' });
        return;
      }
      if (code.includes('invalid-password')) {
        res.status(400).json({ error: 'A senha inicial do owner nao atende aos requisitos do Firebase.' });
        return;
      }
      throw firebaseError;
    }

    await client.query('begin');
    transactionStarted = true;

    const tenantResult = await client.query<{ id: string }>(
      `insert into tenants (name, trade_name, slug, cnpj, phone, legal_representative, city, state, plan, status, created_by_user_id, updated_by_user_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      returning id`,
      [
        normalizedName,
        normalizedTradeName,
        normalizedSlug,
        normalizedCnpj || null,
        normalizedPhone || null,
        normalizedLegalRepresentative,
        normalizedCity,
        normalizedState,
        plan?.trim() || 'starter',
        status || 'active',
        req.auth?.userId,
        req.auth?.userId,
      ]
    );

    const userResult = await client.query<AppUserRow>(
      `insert into users (firebase_uid, email, role, name, status)
       values ($1, $2, 'owner', $3, 'active')
       on conflict (firebase_uid) do update set
         email = excluded.email,
         role = 'owner',
         name = excluded.name,
         status = 'active',
         updated_at = now()
       returning id, firebase_uid, email, name, status, created_at`,
      [createdFirebaseUid, normalizedOwnerEmail, normalizedOwnerName]
    );

    await client.query(
      `insert into tenant_users (tenant_id, user_id, role, status)
       values ($1, $2, 'owner', 'active')
       on conflict (tenant_id, user_id) do update set
         role = 'owner',
         status = 'active',
         updated_at = now()`,
      [tenantResult.rows[0].id, userResult.rows[0].id]
    );

    const created = await client.query<PlatformTenantRow>(
      `select t.id,
              t.name,
              t.trade_name,
              t.slug,
              t.cnpj,
              t.city,
              t.state,
              t.phone,
              t.legal_representative,
              t.plan,
              t.status,
              t.created_at,
              t.updated_at,
              coalesce(created_by_user.name, '') as created_by_name,
              coalesce(updated_by_user.name, '') as updated_by_name,
              coalesce(u.name, '') as owner_name,
              coalesce(u.email, '') as owner_email,
              true as owner_linked
       from tenants t
       left join users created_by_user on created_by_user.id = t.created_by_user_id
       left join users updated_by_user on updated_by_user.id = t.updated_by_user_id
       left join users u on u.id = $2
       where t.id = $1
       limit 1`,
      [tenantResult.rows[0].id, userResult.rows[0].id]
    );

    await client.query('commit');

    res.status(201).json(mapPlatformTenant(created.rows[0]));
  } catch (error) {
    if (transactionStarted) {
      await client.query('rollback');
    }
    if (createdFirebaseUid) {
      await adminAuth.deleteUser(createdFirebaseUid).catch(() => undefined);
    }
    next(error);
  } finally {
    client.release();
  }
});

app.get('/api/revenues', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('read', { read: ['dev', 'owner', 'admin', 'financial'], create: [], update: [], delete: [] }, req.auth?.role), 'Sem permissao para visualizar receitas.')) {
      return;
    }

    await generateMonthlyRevenuesForTenant(req.auth?.tenantId, req.auth?.userId);
    await syncFreightRevenuesForTenant(req.auth?.tenantId, req.auth?.userId);

    const result = await pool.query<RevenueRow>(
      `select id,
              company_id,
              company_name,
              contract_id,
              contract_name,
              freight_id,
              competence_month,
              competence_year,
              competence_label,
              description,
              amount,
              due_date,
              status,
              source_type,
              charge_reference,
              charge_generated_at,
              received_at,
              created_at
       from revenues
       where tenant_id = $1
       order by competence_year desc, competence_month desc, created_at desc`,
      [req.auth?.tenantId]
    );

    res.json(result.rows.map(mapRevenue));
  } catch (error) {
    next(error);
  }
});

app.post('/api/revenues/generate', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('create', { read: [], create: ['dev', 'owner', 'admin', 'financial'], update: [], delete: [] }, req.auth?.role), 'Sem permissao para gerar receitas.')) {
      return;
    }

    const generatedContracts = await generateMonthlyRevenuesForTenant(req.auth?.tenantId, req.auth?.userId);
    const syncedFreights = await syncFreightRevenuesForTenant(req.auth?.tenantId, req.auth?.userId);
    res.json({ generated: generatedContracts + syncedFreights });
  } catch (error) {
    next(error);
  }
});

app.post('/api/revenues/:id/charge', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('create', { read: [], create: ['dev', 'owner', 'admin', 'financial'], update: [], delete: [] }, req.auth?.role), 'Sem permissao para gerar cobrancas.')) {
      return;
    }

    const chargeReference = `COB-${new Date().getFullYear()}-${req.params.id.slice(0, 8).toUpperCase()}`;

    const result = await pool.query<RevenueRow>(
      `update revenues
       set status = case when status = 'received' then status else 'billed' end,
           charge_reference = coalesce(charge_reference, $1),
           charge_generated_at = coalesce(charge_generated_at, now()),
           updated_by_user_id = $2,
           updated_at = now()
       where id = $3
         and tenant_id = $4
       returning id,
                 company_id,
                 company_name,
                 contract_id,
                 contract_name,
                 freight_id,
                 competence_month,
                 competence_year,
                 competence_label,
                 description,
                 amount,
                 due_date,
                 status,
                 source_type,
                 charge_reference,
                 charge_generated_at,
                 received_at,
                 created_at`,
      [chargeReference, req.auth?.userId, req.params.id, req.auth?.tenantId]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Receita nao encontrada.' });
      return;
    }

    res.json(mapRevenue(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

app.post('/api/revenues/:id/receive', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('create', { read: [], create: ['dev', 'owner', 'admin', 'financial'], update: [], delete: [] }, req.auth?.role), 'Sem permissao para atualizar o recebimento.')) {
      return;
    }

    const result = await pool.query<RevenueRow>(
      `update revenues
       set status = 'received',
           received_at = now(),
           updated_by_user_id = $1,
           updated_at = now()
       where id = $2
         and tenant_id = $3
       returning id,
                 company_id,
                 company_name,
                 contract_id,
                 contract_name,
                 freight_id,
                 competence_month,
                 competence_year,
                 competence_label,
                 description,
                 amount,
                 due_date,
                 status,
                 source_type,
                 charge_reference,
                 charge_generated_at,
                 received_at,
                 created_at`,
      [req.auth?.userId, req.params.id, req.auth?.tenantId]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Receita nao encontrada.' });
      return;
    }

    res.json(mapRevenue(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

app.post('/api/revenues/:id/overdue', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('create', { read: [], create: ['dev', 'owner', 'admin', 'financial'], update: [], delete: [] }, req.auth?.role), 'Sem permissao para marcar atraso.')) {
      return;
    }

    const result = await pool.query<RevenueRow>(
      `update revenues
       set status = case when status = 'received' then status else 'overdue' end,
           updated_by_user_id = $1,
           updated_at = now()
       where id = $2
         and tenant_id = $3
       returning id,
                 company_id,
                 company_name,
                 contract_id,
                 contract_name,
                 freight_id,
                 competence_month,
                 competence_year,
                 competence_label,
                 description,
                 amount,
                 due_date,
                 status,
                 source_type,
                 charge_reference,
                 charge_generated_at,
                 received_at,
                 created_at`,
      [req.auth?.userId, req.params.id, req.auth?.tenantId]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Receita nao encontrada.' });
      return;
    }

    res.json(mapRevenue(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  const client = await pool.connect();
  let createdFirebaseUid: string | null = null;
  let transactionStarted = false;

  try {
    if (!ensureAllowed(res, canManageTenantUsers(req.auth?.role), 'Sem permissao para gerenciar usuarios neste tenant.')) {
      return;
    }

    const { email, password, role, name } = req.body as {
      email: string;
      password: string;
      role: AppRole;
      name?: string;
    };
    const normalizedEmail = normalizeRequiredText(email).toLowerCase();
    const normalizedName = normalizeRequiredText(name);
    const normalizedPassword = password || '';

    if (req.auth?.role !== 'dev' && role === 'admin') {
      res.status(403).json({ error: 'Apenas o perfil dev pode promover usuarios para admin.' });
      return;
    }

    const allowedRoles: AppRole[] = req.auth?.role === 'dev'
      ? ['admin', 'financial', 'operational', 'driver', 'viewer']
      : ['financial', 'operational', 'driver', 'viewer'];

    if (!allowedRoles.includes(role)) {
      res.status(400).json({ error: 'Perfil de acesso invalido para cadastro.' });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ error: 'Informe um e-mail valido para o usuario.' });
      return;
    }

    if (normalizedPassword.length < 6) {
      res.status(400).json({ error: 'A senha inicial deve ter pelo menos 6 caracteres.' });
      return;
    }

    const existingUser = await client.query<{ id: string }>(
      `select id
       from users
       where lower(email) = $1
       limit 1`,
      [normalizedEmail]
    );

    if (existingUser.rows[0]) {
      res.status(409).json({ error: 'Ja existe um usuario cadastrado com esse e-mail.' });
      return;
    }

    let firebaseUser;
    try {
      firebaseUser = await adminAuth.createUser({
        email: normalizedEmail,
        password: normalizedPassword,
        displayName: normalizedName || undefined,
      });
      createdFirebaseUid = firebaseUser.uid;
    } catch (firebaseError: any) {
      const code = firebaseError?.code || '';
      if (code.includes('email-already-exists')) {
        res.status(409).json({ error: 'Ja existe um usuario no Firebase com esse e-mail.' });
        return;
      }
      if (code.includes('invalid-password')) {
        res.status(400).json({ error: 'A senha inicial do usuario nao atende aos requisitos do Firebase.' });
        return;
      }
      throw firebaseError;
    }

    await client.query('begin');
    transactionStarted = true;

    const userResult = await client.query<AppUserRow>(
      `insert into users (firebase_uid, email, role, name, status)
       values ($1, $2, $3, $4, 'active')
       returning id, firebase_uid, email, role, name, status, created_at`,
      [createdFirebaseUid, normalizedEmail, role, normalizedName || null]
    );

    const user = userResult.rows[0];

    await client.query(
      `insert into tenant_users (tenant_id, user_id, role, status)
       values ($1, $2, $3, 'active')
       on conflict (tenant_id, user_id) do update set
         role = excluded.role,
         status = excluded.status,
         updated_at = now()`,
      [req.auth?.tenantId, user.id, role]
    );

    await client.query('commit');

    res.status(201).json({
      uid: user.firebase_uid,
      email: user.email,
      role,
      name: user.name,
      tenantId: req.auth?.tenantId,
      tenantName: req.auth?.tenantName,
      tenantSlug: req.auth?.tenantSlug,
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query('rollback');
    }
    if (createdFirebaseUid) {
      await adminAuth.deleteUser(createdFirebaseUid).catch(() => undefined);
    }
    next(error);
  } finally {
    client.release();
  }
});

async function validateAndBuildResourcePayload(
  resourceName: string,
  body: Record<string, unknown>,
  tenantId: string,
  recordId?: string
) {
  switch (resourceName) {
    case 'vehicles': {
      const name = normalizeRequiredText(body.name as string);
      const plate = normalizePlate(body.plate as string);
      const driver = normalizeRequiredText(body.driver as string);
      const type = normalizeRequiredText(body.type as string);
      const km = Number(body.km ?? 0);
      const nextMaintenance = normalizeOptionalText(body.nextMaintenance as string);
      const status = body.status as string;

      if (name.length < 3) throw new Error('Informe um nome valido para o veiculo.');
      if (!isValidPlate(plate)) throw new Error('Informe uma placa valida para o veiculo.');
      if (driver.length < 3) throw new Error('Informe o motorista responsavel pelo veiculo.');
      if (type.length < 3) throw new Error('Informe o tipo do veiculo.');
      if (!isNonNegativeNumber(km)) throw new Error('A quilometragem deve ser um numero igual ou maior que zero.');
      if (nextMaintenance && !isValidDate(nextMaintenance)) throw new Error('A proxima manutencao deve ser uma data valida.');
      if (!['active', 'maintenance', 'alert'].includes(status)) throw new Error('Status do veiculo invalido.');

      const duplicate = await pool.query<{ id: string }>(
        `select id
         from vehicles
         where tenant_id = $1
           and upper(regexp_replace(plate, '[^A-Za-z0-9]', '', 'g')) = $2
           and ($3::uuid is null or id <> $3::uuid)
         limit 1`,
        [tenantId, plate, recordId || null]
      );

      if (duplicate.rows[0]) throw new Error('Ja existe um veiculo cadastrado com essa placa.');

      return { name, plate, driver, type, km, nextMaintenance: nextMaintenance || '', status };
    }
    case 'providers': {
      const name = normalizeRequiredText(body.name as string);
      const type = normalizeRequiredText(body.type as string);
      const rating = Number(body.rating ?? 0);
      const status = normalizeRequiredText(body.status as string);
      const contact = normalizeRequiredText(body.contact as string);
      const email = normalizeRequiredText(body.email as string).toLowerCase();
      const address = normalizeRequiredText(body.address as string);

      if (name.length < 3) throw new Error('Informe um nome valido para o fornecedor.');
      if (type.length < 2) throw new Error('Informe o tipo do fornecedor.');
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) throw new Error('A avaliacao do fornecedor deve ficar entre 0 e 5.');
      if (status.length < 2) throw new Error('Informe o status do fornecedor.');
      if (contact.length < 3) throw new Error('Informe um contato valido para o fornecedor.');
      if (!isValidEmail(email)) throw new Error('Informe um e-mail valido para o fornecedor.');
      if (address.length < 5) throw new Error('Informe um endereco valido para o fornecedor.');

      return { name, type, rating, status, contact, email, address };
    }
    case 'companies': {
      const corporateName = normalizeRequiredText(body.corporateName as string);
      const tradeName = normalizeRequiredText(body.tradeName as string);
      const cnpj = normalizeCnpj(body.cnpj as string);
      const stateRegistration = normalizeRequiredText(body.stateRegistration as string);
      const municipalRegistration = normalizeRequiredText(body.municipalRegistration as string);
      const legalRepresentative = normalizeRequiredText(body.legalRepresentative as string);
      const representativeCpf = normalizeCpf(body.representativeCpf as string);
      const email = normalizeRequiredText(body.email as string).toLowerCase();
      const phone = normalizePhone(body.phone as string);
      const address = normalizeRequiredText(body.address as string);
      const city = normalizeRequiredText(body.city as string);
      const state = normalizeRequiredText(body.state as string).toUpperCase();
      const zipCode = normalizeRequiredText(body.zipCode as string);
      const contractContact = normalizeOptionalText(body.contractContact as string);
      const notes = normalizeOptionalText(body.notes as string);
      const status = body.status as string;

      if (corporateName.length < 3) throw new Error('Informe a razao social da empresa.');
      if (tradeName.length < 2) throw new Error('Informe o nome fantasia da empresa.');
      if (!isValidCnpj(cnpj)) throw new Error('Informe um CNPJ valido para a empresa.');
      if (stateRegistration.length < 2) throw new Error('Informe a inscricao estadual da empresa.');
      if (municipalRegistration.length < 2) throw new Error('Informe a inscricao municipal da empresa.');
      if (legalRepresentative.length < 3) throw new Error('Informe o representante legal da empresa.');
      if (!isValidCpf(representativeCpf)) throw new Error('Informe um CPF valido para o representante.');
      if (!isValidEmail(email)) throw new Error('Informe um e-mail valido para a empresa.');
      if (!isValidPhone(phone)) throw new Error('Informe um telefone valido para a empresa.');
      if (address.length < 5) throw new Error('Informe um endereco valido para a empresa.');
      if (city.length < 2) throw new Error('Informe a cidade da empresa.');
      if (!isValidState(state)) throw new Error('Informe uma UF valida para a empresa.');
      if (zipCode.replace(/\D/g, '').length !== 8) throw new Error('Informe um CEP valido para a empresa.');
      if (!['active', 'inactive'].includes(status)) throw new Error('Status da empresa invalido.');

      const duplicate = await pool.query<{ id: string }>(
        `select id
         from companies
         where tenant_id = $1
           and regexp_replace(cnpj, '\D', '', 'g') = $2
           and ($3::uuid is null or id <> $3::uuid)
         limit 1`,
        [tenantId, cnpj, recordId || null]
      );

      if (duplicate.rows[0]) throw new Error('Ja existe uma empresa cadastrada com esse CNPJ.');

      return {
        corporateName,
        tradeName,
        cnpj,
        stateRegistration,
        municipalRegistration,
        legalRepresentative,
        representativeCpf,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        contractContact: contractContact || '',
        notes: notes || '',
        status,
      };
    }
    case 'contracts': {
      const companyId = normalizeRequiredText(body.companyId as string);
      const contractName = normalizeRequiredText(body.contractName as string);
      const remunerationType = body.remunerationType as string;
      const startDate = normalizeRequiredText(body.startDate as string);
      const endDate = normalizeRequiredText(body.endDate as string);
      const status = body.status as string;
      const notes = normalizeOptionalText(body.notes as string);
      const vehicleIds = Array.isArray(body.vehicleIds) ? (body.vehicleIds as string[]).filter(Boolean) : [];

      if (!isValidUuid(companyId)) throw new Error('Selecione uma empresa valida para o contrato.');
      if (contractName.length < 3) throw new Error('Informe um nome valido para o contrato.');
      if (!['recurring', 'per_trip'].includes(remunerationType)) throw new Error('Tipo de remuneracao invalido.');
      if (!isValidDate(startDate) || !isValidDate(endDate)) throw new Error('As datas do contrato devem ser validas.');
      if (new Date(`${endDate}T00:00:00`) < new Date(`${startDate}T00:00:00`)) throw new Error('A data final do contrato nao pode ser anterior a data inicial.');
      if (!['active', 'renewal', 'closed'].includes(status)) throw new Error('Status do contrato invalido.');
      if (vehicleIds.length === 0) throw new Error('Selecione ao menos um caminhao para o contrato.');

      const companyResult = await pool.query<{ id: string; corporate_name: string }>(
        `select id, corporate_name
         from companies
         where id = $1
           and tenant_id = $2
         limit 1`,
        [companyId, tenantId]
      );
      if (!companyResult.rows[0]) throw new Error('Empresa contratante nao encontrada neste tenant.');

      const vehiclesResult = await pool.query<{ id: string; name: string; plate: string }>(
        `select id, name, plate
         from vehicles
         where tenant_id = $1
           and id = any($2::uuid[])`,
        [tenantId, vehicleIds]
      );
      if (vehiclesResult.rows.length !== vehicleIds.length) throw new Error('Um ou mais veiculos selecionados nao pertencem a este tenant.');

      const annualValue = remunerationType === 'recurring' ? Number(body.annualValue ?? 0) : 0;
      const monthlyValue = remunerationType === 'recurring' ? Number(body.monthlyValue ?? 0) : 0;
      if (remunerationType === 'recurring' && !isPositiveNumber(annualValue)) {
        throw new Error('Informe um valor anual valido para contratos recorrentes.');
      }
      if (remunerationType === 'recurring' && !isNonNegativeNumber(monthlyValue)) {
        throw new Error('O repasse mensal do contrato deve ser valido.');
      }

      return {
        companyId,
        companyName: companyResult.rows[0].corporate_name,
        contractName,
        remunerationType,
        annualValue,
        monthlyValue: remunerationType === 'recurring' ? monthlyValue : 0,
        startDate,
        endDate,
        status,
        vehicleIds: vehiclesResult.rows.map((vehicle) => vehicle.id),
        vehicleNames: vehiclesResult.rows.map((vehicle) => `${vehicle.name} (${vehicle.plate})`),
        notes: notes || '',
      };
    }
    case 'freights': {
      const vehicleId = normalizeRequiredText(body.vehicleId as string);
      const date = normalizeRequiredText(body.date as string);
      const route = normalizeRequiredText(body.route as string);
      const amount = Number(body.amount ?? 0);

      if (!isValidUuid(vehicleId)) throw new Error('Selecione um veiculo valido para o frete.');
      if (!isValidDate(date)) throw new Error('Informe uma data valida para o frete.');
      if (route.length < 5) throw new Error('Informe uma rota valida para o frete.');
      if (!isPositiveNumber(amount)) throw new Error('O valor do frete deve ser maior que zero.');

      const vehicleResult = await pool.query<{ id: string; plate: string }>(
        `select id, plate
         from vehicles
         where id = $1
           and tenant_id = $2
         limit 1`,
        [vehicleId, tenantId]
      );
      if (!vehicleResult.rows[0]) throw new Error('O veiculo informado nao pertence a este tenant.');

      return {
        vehicleId,
        plate: vehicleResult.rows[0].plate,
        date,
        route,
        amount,
      };
    }
    case 'expenses': {
      const date = normalizeRequiredText(body.date as string);
      const time = normalizeRequiredText(body.time as string);
      const vehicleId = normalizeRequiredText(body.vehicleId as string);
      const provider = normalizeRequiredText(body.provider as string);
      const category = normalizeRequiredText(body.category as string);
      const quantity = String(body.quantity ?? '').trim();
      const amount = Number(body.amount ?? 0);
      const odometer = String(body.odometer ?? '').trim();
      const status = body.status as string;
      const observations = normalizeOptionalText(body.observations as string);

      if (!isValidDate(date)) throw new Error('Informe uma data valida para a despesa.');
      if (!isValidTime(time)) throw new Error('Informe um horario valido para a despesa.');
      if (!isValidUuid(vehicleId)) throw new Error('Selecione um veiculo valido para a despesa.');
      if (provider.length < 2) throw new Error('Informe um fornecedor valido para a despesa.');
      if (category.length < 2) throw new Error('Informe uma categoria valida para a despesa.');
      if (!isPositiveNumber(amount)) throw new Error('O valor da despesa deve ser maior que zero.');
      if (quantity && !isNonNegativeNumber(quantity)) throw new Error('A quantidade da despesa deve ser um numero valido.');
      if (odometer && !isNonNegativeNumber(odometer)) throw new Error('O odometro da despesa deve ser um numero valido.');
      if (!['approved', 'review', 'pending'].includes(status)) throw new Error('Status da despesa invalido.');

      const vehicleResult = await pool.query<{ id: string; name: string }>(
        `select id, name
         from vehicles
         where id = $1
           and tenant_id = $2
         limit 1`,
        [vehicleId, tenantId]
      );
      if (!vehicleResult.rows[0]) throw new Error('O veiculo informado nao pertence a este tenant.');

      return {
        date,
        time,
        vehicleId,
        vehicleName: vehicleResult.rows[0].name,
        provider,
        category,
        quantity,
        amount,
        odometer,
        status,
        observations: observations || '',
      };
    }
    default:
      return body;
  }
}

for (const [resourceName, resource] of Object.entries(resources)) {
  app.get(`/api/${resourceName}`, loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!ensureAllowed(res, canPerform('read', resource.permissions, req.auth?.role), 'Sem permissao para visualizar este recurso.')) {
        return;
      }

      const result = await pool.query(
        `select id, tenant_id, ${resource.fields.map((field) => field.db).join(', ')}
         from ${resource.table}
         where tenant_id = $1
         order by ${resource.orderBy}`,
        [req.auth?.tenantId]
      );

      res.json(result.rows.map((row) => mapRow(row, resource.fields)));
    } catch (error) {
      next(error);
    }
  });

  app.post(`/api/${resourceName}`, loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!ensureAllowed(res, canPerform('create', resource.permissions, req.auth?.role), 'Sem permissao para criar neste recurso.')) {
        return;
      }

      const payload = await validateAndBuildResourcePayload(resourceName, req.body as Record<string, unknown>, req.auth?.tenantId || '');
      const columns = ['tenant_id', 'created_by_user_id', 'updated_by_user_id', ...resource.fields.map((field) => field.db)];
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
      const values = [req.auth?.tenantId, req.auth?.userId, req.auth?.userId, ...resource.fields.map((field) => (payload as Record<string, unknown>)[field.api])];
      const result = await pool.query(
        `insert into ${resource.table} (${columns.join(', ')})
         values (${placeholders})
         returning id, tenant_id, ${resource.fields.map((field) => field.db).join(', ')}`,
        values
      );

      if (resourceName === 'freights') {
        await syncFreightRevenue(req.auth?.tenantId, {
          id: result.rows[0].id as string,
          plate: String(result.rows[0].plate || ''),
          date: String(result.rows[0].date || ''),
          route: String(result.rows[0].route || ''),
          amount: result.rows[0].amount as string | number,
        }, req.auth?.userId);
      }

      res.status(201).json(mapRow(result.rows[0], resource.fields));
    } catch (error) {
      next(error);
    }
  });

  app.put(`/api/${resourceName}/:id`, loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!ensureAllowed(res, canPerform('update', resource.permissions, req.auth?.role), 'Sem permissao para editar este recurso.')) {
        return;
      }

      const payload = await validateAndBuildResourcePayload(resourceName, req.body as Record<string, unknown>, req.auth?.tenantId || '', req.params.id);
      const assignments = [
        ...resource.fields.map((field, index) => `${field.db} = $${index + 1}`),
        `updated_by_user_id = $${resource.fields.length + 1}`,
      ];
      const params = [
        ...resource.fields.map((field) => (payload as Record<string, unknown>)[field.api]),
        req.auth?.userId,
        req.params.id,
        req.auth?.tenantId,
      ];

      const result = await pool.query(
        `update ${resource.table}
         set ${assignments.join(', ')}, updated_at = now()
         where id = $${resource.fields.length + 2}
           and tenant_id = $${resource.fields.length + 3}
         returning id, tenant_id, ${resource.fields.map((field) => field.db).join(', ')}`,
        params
      );

      if (!result.rows[0]) {
        res.status(404).json({ error: 'Registro nao encontrado.' });
        return;
      }

      if (resourceName === 'freights') {
        await syncFreightRevenue(req.auth?.tenantId, {
          id: result.rows[0].id as string,
          plate: String(result.rows[0].plate || ''),
          date: String(result.rows[0].date || ''),
          route: String(result.rows[0].route || ''),
          amount: result.rows[0].amount as string | number,
        }, req.auth?.userId);
      }

      res.json(mapRow(result.rows[0], resource.fields));
    } catch (error) {
      next(error);
    }
  });

  app.delete(`/api/${resourceName}/:id`, loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!ensureAllowed(res, canPerform('delete', resource.permissions, req.auth?.role), 'Sem permissao para excluir este recurso.')) {
        return;
      }

      if (resourceName === 'freights') {
        await pool.query(
          `delete from revenues
           where freight_id = $1
             and tenant_id = $2`,
          [req.params.id, req.auth?.tenantId]
        );
      }

      const result = await pool.query(
        `delete from ${resource.table}
         where id = $1 and tenant_id = $2
         returning id`,
        [req.params.id, req.auth?.tenantId]
      );

      if (!result.rows[0]) {
        res.status(404).json({ error: 'Registro nao encontrado.' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
}

app.use((error: Error & { code?: string; constraint?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);

  if (error.code === '23505') {
    const messageByConstraint: Record<string, string> = {
      idx_tenants_cnpj_digits: 'Ja existe uma transportadora cadastrada com esse CNPJ.',
      idx_vehicles_tenant_plate: 'Ja existe um veiculo cadastrado com essa placa.',
      idx_companies_tenant_cnpj: 'Ja existe uma empresa cadastrada com esse CNPJ.',
      users_firebase_uid_key: 'Ja existe um usuario cadastrado com esse identificador no Firebase.',
      tenants_slug_key: 'Ja existe uma transportadora cadastrada com esse slug.',
    };

    res.status(409).json({ error: messageByConstraint[error.constraint || ''] || 'Ja existe um registro com esses dados.' });
    return;
  }

  res.status(500).json({ error: error.message || 'Erro interno do servidor.' });
});

export default app;
