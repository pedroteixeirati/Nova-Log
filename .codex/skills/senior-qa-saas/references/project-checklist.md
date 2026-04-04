# Checklist de Auditoria do Projeto

## Para cada feature relevante

- validar fluxo feliz
- validar cenarios negativos
- validar mensagens de erro e sucesso
- validar permissao por papel
- validar comportamento em tenant atual
- validar risco de vazamento entre tenants
- validar consistencia entre UI, API e banco
- validar efeito em relatorios quando a feature impacta financeiro ou operacao

## Antes de considerar pronto

- risco critico identificado foi tratado ou explicitado
- regressao provavel foi analisada
- nao existe feedback enganoso na interface
- integridade de negocio esta protegida no backend
- estado salvo e recarregado bate com o que o usuario viu

## Prioridade de Teste

1. P0: seguranca, multiempresa, financeiro, perda de dados, permissao
2. P1: fluxo principal de negocio e formularios centrais
3. P2: refinamentos visuais, texto, responsividade e conveniencia
