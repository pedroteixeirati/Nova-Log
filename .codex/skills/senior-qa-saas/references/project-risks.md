# Riscos Recorrentes do Projeto

## Multiempresa

- vazamento de dados entre tenants
- filtro por tenant ausente ou incompleto
- permissao correta na UI, mas incorreta na API
- usuario com papel inadequado acessando acao sensivel

## Financeiro

- receita recorrente gerada para contrato por viagem
- divergencia entre receitas, fretes, despesas e relatorios
- status financeiro na tela sem coerencia com o banco
- interface sugerindo recebimento ou cobranca quando a persistencia e fraca

## Cadastros

- duplicidade de placa ou CNPJ
- frontend mascarando validacao que o backend nao garante
- erro silencioso apos submit
- tela salvando parcialmente ou com feedback insuficiente

## UX

- contagens e indicadores que o usuario pode interpretar errado
- botoes com semantica enganosa
- agrupamentos de menu que parecem mostrar dado, mas mostram estrutura
- mensagens genericas que nao ajudam o usuario a se recuperar

## Postura Esperada

- nao aceitar "funciona visualmente" como evidencia suficiente
- testar sempre o fluxo inteiro
- relacionar falha tecnica com impacto operacional real
