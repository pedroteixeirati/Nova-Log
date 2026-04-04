# Contexto do Projeto

## Stack Atual

- Frontend: React 19 + TypeScript + Vite
- Estilo e UI: Tailwind CSS, Motion, Lucide, Recharts
- Backend: Express + TypeScript
- Banco: PostgreSQL
- Autenticacao: Firebase Auth
- Validacao de token no backend: Firebase Admin

## Natureza do Produto

- SaaS B2B para transportadoras
- Multiempresa por `tenant_id`
- Papeis: `dev`, `owner`, `admin`, `financial`, `operational`, `driver`, `viewer`
- Modulos principais:
  - transportadoras
  - perfil da transportadora
  - usuarios
  - veiculos
  - fornecedores
  - empresas contratantes
  - contratos
  - fretes
  - receitas
  - despesas
  - relatorios

## Arquitetura Atual

- Frontend consome API propria.
- Backend valida o token Firebase e resolve o contexto do tenant.
- PostgreSQL e fonte principal dos dados de negocio.
- O sistema ja passou por endurecimento de:
  - permissoes
  - validacoes de CRUD
  - unicidade de negocio
  - auditoria
  - testes automatizados de dominio e estrutura

## Contexto Importante

- O projeto esta em evolucao e possui partes legadas.
- Nem toda decisao antiga deve ser reproduzida.
- A skill deve usar o contexto para entender o sistema, nao para normalizar fragilidades.
