# Riscos e Anti-Padroes a Evitar

## Postura

Nao assumir que o codigo atual esta correto so porque compila ou ja existe em producao/local.

## Anti-padroes que a skill deve evitar repetir

- confiar apenas no frontend para validacao
- esconder acao na UI sem proteger a API
- criar fluxo que depende de fallback silencioso
- manter botoes ou mensagens que sugerem persistencia sem salvar nada
- derivar dado sensivel no frontend quando ele pode ser resolvido no backend
- repetir regra de negocio em varios lugares sem uma fonte de verdade
- calcular financeiro apenas com aproximacao visual quando existe entidade financeira propria
- usar logica hardcoded por e-mail, nome ou atalho operacional
- misturar contexto de plataforma com contexto de tenant
- tratar multiempresa como detalhe superficial

## Riscos criticos do dominio

- vazamento entre tenants
- elevacao de privilegio por falha de permissao
- receita recorrente gerada para contrato por viagem
- inconsistencias entre frete, receita, despesa e relatorios
- duplicidade de placa e CNPJ
- contas ou usuarios criados fora do fluxo seguro
- falta de rastreabilidade para recursos sensiveis

## Como agir diante de legado fragil

- nao normalizar o problema
- explicar o risco de forma objetiva
- corrigir junto da feature quando o risco for real
- se nao der para corrigir imediatamente, isolar o impacto e deixar claro o debito tecnico
