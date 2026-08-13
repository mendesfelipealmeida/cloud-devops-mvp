# Relatorio Pratico - Pedidos Veloz

## 1. Visao geral do MVP

O MVP implementa a plataforma Pedidos Veloz como uma aplicacao distribuida baseada em microsservicos. A solucao contempla API Gateway, Orders Service, Payments Service, Inventory Service, PostgreSQL, Prometheus, Jaeger, Docker Compose, manifests Kubernetes, pipeline GitHub Actions, ESLint, testes automatizados e esqueleto Terraform.

O objetivo e demonstrar uma proposta fim a fim para desenvolvimento local padronizado, verificacao de qualidade, build e publicacao de imagens, deploy em Kubernetes, observabilidade e escalabilidade.

## 2. Ambiente local com Docker Compose

O arquivo `docker-compose.yml` sobe todos os componentes com um unico comando:

```bash
docker compose up --build
```

O Compose define uma rede bridge chamada `pedidos-net`, volume persistente para PostgreSQL e variaveis de ambiente por servico. O banco inicializa automaticamente com `database/schema.sql`, criando as tabelas `products` e `orders` e cadastrando produtos de exemplo.

Servicos expostos:

- API Gateway: porta 3000.
- Orders Service: porta 3001.
- Payments Service: porta 3002.
- Inventory Service: porta 3003.
- PostgreSQL: porta 5432.
- Prometheus: porta 9090.
- Jaeger: porta 16686.

## 3. Conteinerizacao e versionamento

O `Dockerfile` utiliza build multi-stage. A etapa `dependencies` instala apenas dependencias de producao com `npm ci --omit=dev`. A etapa `runtime` copia somente `node_modules`, `package*.json` e `src`, reduzindo o conteudo final da imagem.

Boas praticas aplicadas:

- imagem base `node:20-alpine`;
- usuario nao-root `appuser`;
- `WORKDIR` fixo;
- comando separado por servico no Compose e no Kubernetes;
- imagens versionadas pelo SHA do commit no pipeline.

No CI/CD, as imagens sao publicadas no GitHub Container Registry com duas tags: SHA do commit e `latest`. O deploy usa a tag do SHA para garantir reproducibilidade.

## 4. Kubernetes - producao minima

Os manifests estao em `k8s/` e incluem:

- `namespace.yaml`: namespace com labels de Pod Security Admission.
- `configmap.yaml`: configuracoes nao sensiveis.
- `secret.yaml`: usuario e senha do PostgreSQL.
- `postgres.yaml`: Deployment e Service do banco.
- `api-gateway.yaml`, `orders.yaml`, `payments.yaml`, `inventory.yaml`: Deployments e Services.
- `hpa.yaml`: escalabilidade horizontal.

Os Deployments definem readiness e liveness probes em `/health`, requests/limits de CPU e memoria e estrategia RollingUpdate nos servicos principais. O API Gateway usa Service `LoadBalancer`; os servicos internos usam Service cluster-internal.

Os manifests mantem uma tag base `1.0.0` para leitura local, mas o pipeline nao aplica essa tag diretamente. No job de deploy, os arquivos sao copiados para `rendered-k8s/` e as imagens sao substituidas por `${IMAGE_PREFIX}-servico:${GITHUB_SHA}` antes do `kubectl apply`.

## 5. CI/CD

O workflow `.github/workflows/ci-cd.yml` possui tres jobs:

- `test`: checkout, Node.js 20, `npm ci`, `npm run lint`, `npm test` e `docker compose config`.
- `publish`: build e push das imagens para GHCR com `${GITHUB_SHA}` e `latest`.
- `deploy`: configura kubeconfig, renderiza manifests com `${GITHUB_SHA}` e aplica `rendered-k8s/`.

Secrets usados:

- `GITHUB_TOKEN`: publicacao no GHCR.
- `KUBE_CONFIG`: acesso ao cluster Kubernetes.

Esse fluxo impede deploy sem lint, sem teste ou sem validacao do Compose. Tambem garante coerencia entre build e deploy, porque a mesma tag `${GITHUB_SHA}` criada no job `publish` e usada nos Deployments Kubernetes.

## 6. Observabilidade

Todos os servicos expoem:

- `/health`: saude do container para probes.
- `/metrics`: contadores Prometheus de requisicoes e erros.

Os logs sao estruturados em JSON e incluem servico, `requestId`, metodo, rota, status e duracao. O `requestId` e propagado nas chamadas internas, permitindo correlacionar eventos entre gateway, pedidos, estoque e pagamentos.

Metricas e logs estao implementados no codigo. O tracing distribuido nao esta totalmente implementado: o Compose inclui Jaeger e a arquitetura define OpenTelemetry/Jaeger como caminho conceitual para evolucao, com spans em cada chamada HTTP e exportacao via OTLP.

## 7. Deploy e escala

A estrategia escolhida foi Rolling Update. Ela e simples, nativa do Kubernetes e adequada para o MVP porque reduz indisponibilidade sem exigir duas pilhas completas como blue/green. O parametro `maxUnavailable: 0` nos servicos principais evita retirar replicas antigas antes de novas ficarem prontas.

Para escalabilidade, foi adotado HPA baseado em CPU. O API Gateway escala de 2 a 8 replicas, Orders de 2 a 10 e Inventory de 2 a 8. O Payments Service tambem roda com duas replicas, mas nao recebeu HPA no MVP por ser um mock stateless de baixa complexidade.

## 8. Infraestrutura como codigo

O diretorio `terraform/` apresenta um esqueleto independente de provedor. Ele organiza variaveis, modulos e outputs esperados para rede, cluster Kubernetes e registry. A ideia e demonstrar como a infraestrutura seria reproduzida em um provedor real, como EKS, AKS ou GKE, sem prender o trabalho a uma conta cloud especifica.

## 9. Exemplo concreto pesquisado: Online Boutique

O case oficial `GoogleCloudPlatform/microservices-demo`, conhecido como Online Boutique, e uma aplicacao de e-commerce em microsservicos usada pelo Google Cloud para demonstrar modernizacao cloud-native. Ela roda em Kubernetes e combina servicos como frontend, cartservice, productcatalogservice, paymentservice, checkoutservice, recommendationservice, shippingservice, emailservice, adservice, currencyservice e loadgenerator.

Comparacao com a Pedidos Veloz:

- Online Boutique cobre uma jornada de loja virtual mais completa; Pedidos Veloz foca no fluxo minimo de pedido.
- Online Boutique usa varios idiomas e comunicacao gRPC; Pedidos Veloz usa Node.js/Express e chamadas HTTP para manter o MVP didatico.
- Ambas separam capacidades de negocio em servicos independentes e usam Kubernetes como base de execucao.
- Ambas valorizam observabilidade e operacao cloud-native; na Pedidos Veloz, metricas e logs ja estao implementados, enquanto tracing fica planejado com Jaeger/OpenTelemetry.

Fonte oficial: https://github.com/GoogleCloudPlatform/microservices-demo

## 10. Como demonstrar

1. Rodar `npm run lint`.
2. Rodar `npm test`.
3. Rodar `docker compose up --build`.
4. Abrir `http://localhost:3000`.
5. Listar produtos em `/products`.
6. Criar um pedido com `POST /orders`.
7. Ver metricas no Prometheus.
8. Mostrar manifests em `k8s/` e workflow em `.github/workflows/ci-cd.yml`.
9. Explicar que o CD publica imagens com `${GITHUB_SHA}` e renderiza os Deployments com essa mesma tag.
10. Explicar Terraform como esqueleto de reproducao da infraestrutura.
