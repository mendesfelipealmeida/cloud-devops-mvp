# Parte Teorica - Pedidos Veloz

## 1. Microservicos e DevOps cloud-native

A arquitetura de microservicos divide uma aplicacao em servicos menores, independentes e organizados por capacidade de negocio. No caso da Pedidos Veloz, a plataforma foi dividida em API Gateway, Pedidos, Pagamentos e Estoque. Essa separacao reduz acoplamento, permite escalar partes especificas do sistema e facilita a evolucao por times diferentes.

DevOps e essencial nesse contexto porque microsservicos aumentam a quantidade de artefatos, ambientes, pipelines, configuracoes e pontos de falha. A pratica DevOps conecta desenvolvimento e operacao por meio de automacao, padronizacao, monitoramento e feedback continuo. Em vez de cada time subir uma parte "como da", o projeto define Docker Compose para desenvolvimento local, Kubernetes para producao, GitHub Actions para CI/CD e observabilidade com metricas, logs e tracing.

## 2. Conteinerizacao, Docker e Kubernetes

Conteinerizacao empacota aplicacao, runtime e dependencias em uma imagem reproduzivel. O Docker e usado para construir e executar containers. Ele resolve o problema de diferencas entre maquinas de desenvolvedores, servidores e pipelines, garantindo que o mesmo artefato rode de forma previsivel.

Docker Compose e adequado para desenvolvimento local e validacao de uma arquitetura multi-servico. Com um unico comando, o time sobe gateway, servicos internos, PostgreSQL, Prometheus e Jaeger. Isso reduz tempo de configuracao e aproxima o ambiente local da topologia real.

Kubernetes entra quando ha necessidade de operacao em producao: agendamento de pods, Services, Deployments, probes, autoscaling, ConfigMaps, Secrets e politicas de seguranca. Enquanto Docker/Compose empacotam e organizam a execucao local, Kubernetes orquestra containers em cluster, recria instancias com falha e controla rollout de novas versoes.

## 3. Orquestracao de containers

Orquestrar containers significa manter o estado desejado da aplicacao. Na Pedidos Veloz, os manifests Kubernetes declaram quantas replicas cada servico deve ter, quais portas expor, quais variaveis de ambiente carregar e como verificar saude via readiness e liveness probes.

Readiness probe evita que um pod receba trafego antes de estar pronto. Liveness probe permite reiniciar containers que travaram ou ficaram indisponiveis. A estrategia de Deployment usa RollingUpdate, com `maxUnavailable: 0`, para reduzir risco durante deploys porque uma nova versao entra gradualmente sem retirar todas as replicas antigas ao mesmo tempo.

## 4. CI/CD em sistemas distribuidos

Em microsservicos, CI/CD precisa validar codigo e infraestrutura antes do deploy. O pipeline criado no GitHub Actions instala dependencias, executa testes, valida o Compose, constroi imagens e publica no GitHub Container Registry. Em seguida, o job de deploy aplica os manifests Kubernetes usando um `KUBE_CONFIG` armazenado como secret.

Essa abordagem melhora governanca porque o deploy deixa de ser manual e passa a ter etapas verificaveis. Tambem reduz falhas comuns, como imagem sem tag, configuracao quebrada ou falta de teste antes de publicar.

## 5. Observabilidade: metricas, logs e traces

Observabilidade combina tres pilares. Metricas mostram comportamento numerico do sistema, como quantidade de requisicoes e erros por servico. Logs registram eventos com contexto, como `requestId`, rota, status HTTP e duracao. Traces acompanham uma requisicao entre servicos diferentes, algo importante quando o pedido passa por gateway, estoque, pagamento e pedidos.

O MVP ja expoe metricas em `/metrics` e logs estruturados em JSON. O Compose inclui Prometheus para coleta e Jaeger para demonstrar a estrategia de tracing. Como evolucao, a aplicacao pode receber SDK OpenTelemetry para gerar spans distribuidos automaticamente e enviar os dados para Jaeger ou outro backend compativel.

## 6. Decisoes arquiteturais

A API Gateway centraliza entrada e simplifica o consumo externo. O Orders Service orquestra o fluxo principal de negocio, chamando Estoque para reserva e Pagamentos para autorizacao. O Payments Service e um mock controlado porque a integracao real externa nao faz parte do MVP. O Inventory Service usa transacao e bloqueio de linha no PostgreSQL para evitar reserva concorrente acima do estoque disponivel.

PostgreSQL foi escolhido por ser robusto para dados transacionais. O Dockerfile usa multi-stage e usuario nao-root para reduzir superficie de ataque. Kubernetes usa ConfigMaps para configuracoes nao sensiveis e Secrets para credenciais. HPA foi escolhido para escalar horizontalmente os servicos HTTP de acordo com CPU, uma estrategia simples e alinhada a picos de trafego de e-commerce.

## Fontes

- Documentacao oficial do Kubernetes: https://kubernetes.io/docs/
- Probes no Kubernetes: https://kubernetes.io/docs/concepts/workloads/pods/probes/
- Seguranca no Kubernetes: https://kubernetes.io/docs/concepts/security/
- Docker Compose e aplicacoes multi-container: https://docs.docker.com/get-started/docker-concepts/running-containers/multi-container-applications/
- Boas praticas de Dockerfile: https://docs.docker.com/build/building/best-practices/
- GitHub Actions para Node.js: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
- Publicacao de imagens Docker com GitHub Actions: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
- Terraform: https://developer.hashicorp.com/terraform/language
- OpenTelemetry: https://opentelemetry.io/docs/
- 12-Factor App: https://12factor.net/
