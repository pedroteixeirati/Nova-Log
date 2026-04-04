# Contexto do Projeto

## Produto

- SaaS B2B para transportadoras
- Multiempresa por `tenant_id`
- Plataforma da JP Soft
- Cada transportadora cliente opera como um tenant separado

## Modulos Principais

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

## Stack Atual

- Frontend: React 19 + TypeScript + Vite
- Backend: Express + TypeScript
- Banco: PostgreSQL
- Autenticacao: Firebase Auth
- Validacao de token no backend: Firebase Admin

## Maturidade Atual

- sistema ja passou por endurecimento de permissoes
- validacoes de CRUD foram reforcadas
- existe auditoria em recursos sensiveis
- existem testes automatizados de dominio e estrutura
- ainda ha legado e decisoes antigas que nao devem ser tratadas como verdade absoluta
