# Relatorio Pratico - Pedidos Veloz

## 1. Visao geral do MVP

O MVP implementa a plataforma Pedidos Veloz como uma aplicacao distribuida baseada em microsservicos. A solucao contempla API Gateway, Orders Service, Payments Service, Inventory Service, PostgreSQL, Prometheus, Jaeger, Docker Compose, manifests Kubernetes, pipeline GitHub Actions e esqueleto Terraform.

O objetivo e demonstrar uma proposta fim a fim para desenvolvimento local padronizado, build e publicacao de imagens, deploy em Kubernetes, observabilidade e escalabilidade.

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
- imagens versionaveis por tag no pipeline.

No CI/CD, as imagens sao publicadas no GitHub Container Registry com duas tags: SHA do commit e `latest`.

## 4. Kubernetes - producao minima

Os manifests estao em `k8s/` e incluem:

- `namespace.yaml`: namespace com labels de Pod Security Admission.
- `configmap.yaml`: configuracoes nao sensiveis.
- `secret.yaml`: usuario e senha do PostgreSQL.
- `postgres.yaml`: Deployment e Service do banco.
- `api-gateway.yaml`, `orders.yaml`, `payments.yaml`, `inventory.yaml`: Deployments e Services.
- `hpa.yaml`: escalabilidade horizontal.

Os Deployments definem readiness e liveness probes em `/health`, requests/limits de CPU e memoria e estrategia RollingUpdate nos servicos principais. O API Gateway usa Service `LoadBalancer`; os servicos internos usam Service cluster-internal.

## 5. CI/CD

O workflow `.github/workflows/ci-cd.yml` possui tres jobs:

- `test`: checkout, Node.js 20, `npm ci`, `npm test` e `docker compose config`.
- `publish`: build e push das imagens para GHCR.
- `deploy`: aplica manifests Kubernetes usando `kubectl apply -f k8s/`.

Secrets usados:

- `GITHUB_TOKEN`: publicacao no GHCR.
- `KUBE_CONFIG`: acesso ao cluster Kubernetes.

Esse fluxo impede deploy sem teste e torna o processo reproduzivel.

## 6. Observabilidade

Todos os servicos expõem:

- `/health`: saude do container para probes.
- `/metrics`: contadores Prometheus de requisicoes e erros.

Os logs sao estruturados em JSON e incluem servico, `requestId`, metodo, rota, status e duracao. O `requestId` e propagado nas chamadas internas, permitindo correlacionar eventos entre gateway, pedidos, estoque e pagamentos.

Para tracing distribuido, o Compose inclui Jaeger e a arquitetura esta preparada para instrumentacao com OpenTelemetry. A evolucao natural e adicionar spans em cada chamada HTTP e exporta-los via OTLP para Jaeger.

## 7. Deploy e escala

A estrategia escolhida foi Rolling Update. Ela e simples, nativa do Kubernetes e adequada para o MVP porque reduz indisponibilidade sem exigir duas pilhas completas como blue/green. O parametro `maxUnavailable: 0` nos servicos principais evita retirar replicas antigas antes de novas ficarem prontas.

Para escalabilidade, foi adotado HPA baseado em CPU. O API Gateway escala de 2 a 8 replicas, Orders de 2 a 10 e Inventory de 2 a 8. O Payments Service tambem roda com duas replicas, mas nao recebeu HPA no MVP por ser um mock stateless de baixa complexidade.

## 8. Infraestrutura como codigo

O diretorio `terraform/` apresenta um esqueleto independente de provedor. Ele organiza variaveis, modulos e outputs esperados para rede, cluster Kubernetes e registry. A ideia e demonstrar como a infraestrutura seria reproduzida em um provedor real, como EKS, AKS ou GKE, sem prender o trabalho a uma conta cloud especifica.

## 9. Exemplo concreto pesquisado

O desenho segue recomendacoes de documentacoes oficiais: Docker para empacotamento e Compose multi-container, Kubernetes para Deployments, Services, probes, ConfigMaps, Secrets e HPA, GitHub Actions para pipeline e Terraform para IaC modular. Um exemplo publico equivalente e a arquitetura de referencia cloud-native promovida pelo ecossistema Kubernetes, em que workloads sao declarados como Deployments, expostos por Services e operados com probes, autoscaling e configuracao externa.

## 10. Como demonstrar

1. Rodar `docker compose up --build`.
2. Abrir `http://localhost:3000`.
3. Listar produtos em `/products`.
4. Criar um pedido com `POST /orders`.
5. Ver metricas no Prometheus.
6. Mostrar manifests em `k8s/` e workflow em `.github/workflows/ci-cd.yml`.
7. Explicar Terraform como esqueleto de reproducao da infraestrutura.
