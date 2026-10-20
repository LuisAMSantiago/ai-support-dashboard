# Escopo demonstrativo e critérios de conclusão

Status: **Escopo técnico concluído — projeto demonstrativo**.

Data de conclusão desta entrega: **20 de outubro de 2026**.

## Objetivo da entrega

Demonstrar uma SPA React integrada a uma API Laravel com autenticação por
sessão, persistência de tickets, histórico, indicadores e processamento de IA
por jobs. O ambiente de referência é local, com dados de demonstração e uma
conta por participante. A conclusão se refere ao escopo abaixo.

## Funcionalidades incluídas

| Área | Entrega | Evidência de verificação |
| --- | --- | --- |
| Autenticação | Cadastro, login, consulta da sessão, logout e proteção de rotas | Testes dos formulários, ProtectedRoute e transporte de credenciais/CSRF |
| Tickets | Criação, consulta, edição, busca, filtros, ordenação e paginação | Testes do formulário, cliente de API e TicketApiTest |
| Ciclo de vida | Aberto, em progresso, aguardando, resolvido, fechado e reabertura | DemoWorkflowTest e teste do formulário de edição |
| Lixeira | Exclusão lógica, listagem, restauração e exclusão definitiva | Testes do cliente de API e DemoWorkflowTest |
| Autorização | Restrição de leitura, edição e exclusão por proprietário; política de administrador existente | TicketAuthorizationTest |
| IA | Solicitação de resumo, sugestão de resposta e classificação de prioridade; estados de fila, processamento, sucesso e falha | Testes dos jobs, TicketAiQueueTest, cliente de API e indicador de IA |
| Histórico | Eventos de criação, atualização, status, exclusão, restauração e conclusão de IA | Testes de ciclo de vida, classificação e formatação de eventos |
| Indicadores | Resumo dos tickets, backlog por idade e feed de atividades | Testes do cliente de API e isolamento das métricas no backend |
| Qualidade | Lint sem erros nem avisos, checagem TypeScript, testes automatizados e build | Comandos de aceite abaixo |

## Critérios de aceite

Todos os comandos abaixo devem terminar com código de saída zero.

No diretório `backend/`:

```sh
composer install
composer test
```

Os testes do backend usam SQLite em memória, sem alterar o banco de
demonstração. É necessário PHP 8.3 ou superior para a suíte Pest 4, com as
extensões exigidas pelo Composer e PDO SQLite.

No diretório `frontend/`:

```sh
npm ci
npm run check
```

`check` executa lint com zero avisos, tipagem, testes e build. A suíte usa
Vitest, Testing Library e jsdom. Testa comportamento de componentes e o
contrato do cliente HTTP com transporte simulado. A integração do backend
é testada separadamente com banco em memória. Não se trata de uma suíte
end-to-end em navegador conectado ao servidor.

## Limites da demonstração

- O modo de IA padrão é `MockAiTicketService`, determinístico e sem chamadas
  externas. O adaptador do provedor real está disponível mediante configuração;
  credenciais, cobrança e qualidade das respostas externas não fazem parte do
  aceite automatizado desta entrega.
- A resposta sugerida é exibida para revisão; envio de mensagens ao cliente,
  integração com e-mail e help desks não fazem parte do escopo.
- O campo de responsável é uma extensão de dados existente; gestão de equipes,
  atribuição de agentes, organizações, SLAs e atendimento multicanal ficam fora
  do escopo demonstrativo.
- Implantação pública, validação com usuários reais, auditoria de segurança,
  recuperação de senha, backups, monitoramento, gestão operacional de filas e
  processo de deploy de produção não são critérios desta entrega.
- O build pode emitir o aviso de tamanho do chunk JavaScript. Divisão de bundle
  e otimização de carregamento são melhorias posteriores, sem impedir o aceite
  funcional local.

## Regra para mudanças futuras

As funcionalidades desta versão constituem a linha de base concluída. Novos
recursos, implantação e requisitos de produção devem ser registrados como
novas entregas. Defeitos encontrados no escopo existente continuam sendo
correções, mesmo após esta conclusão. A classificação não implica MVP, produção
ou acompanhamento operacional contínuo.
