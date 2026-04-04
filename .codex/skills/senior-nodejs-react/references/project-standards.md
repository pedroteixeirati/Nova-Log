# Padroes Desejados do Projeto

## Backend

- validacao forte e centralizada
- regra de negocio fora de controllers quando a complexidade crescer
- permissoes reais no backend
- tenant como fronteira obrigatoria de dados
- mensagens de erro de negocio claras
- auditoria em recursos sensiveis
- integridade de negocio reforcada no banco
- testes automatizados para regras criticas

## Frontend

- formularios com loading, erro, sucesso e prevencao de duplo envio
- feedback honesto sobre o que realmente foi salvo
- estados vazios claros
- lista, filtro e acao com comportamento consistente entre modulos
- componentes legiveis e com pouca logica acoplada
- UX empresarial: clara, objetiva e sem ambiguidades

## Full Stack

- UI, API e banco devem refletir a mesma regra de negocio
- derivacoes sensiveis devem ocorrer no backend sempre que possivel
- nao duplicar validacoes importantes sem motivo
- tratar concorrencia e idempotencia quando houver acao repetivel
- sempre pensar em multiempresa, papel do usuario e rastreabilidade

## Qualidade Minima Antes de Fechar uma Tarefa

- `npm run lint`
- `npm run build`
- `npm run test`
- validacao de impacto no tenant atual e nas permissoes afetadas
- revisao de risco funcional, tecnico e de regressao
