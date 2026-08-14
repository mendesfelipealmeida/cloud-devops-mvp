# Pedidos Veloz - Cloud DevOps MVP

Plataforma de pedidos em microsservicos para o desafio de Cloud DevOps. O projeto demonstra ambiente local com Docker Compose, conteinerizacao, Kubernetes, CI/CD com lint e testes, observabilidade com metricas/logs e esqueleto de IaC com Terraform.

## Arquitetura

- API Gateway: entrada HTTP unica para clientes.
- Orders Service: cria e consulta pedidos.
- Payments Service: simula autorizacao de pagamento externo.
- Inventory Service: lista produtos e reserva estoque.
- PostgreSQL: banco relacional da plataforma.
- Prometheus: coleta metricas expostas em `/metrics`.
- Jaeger/OpenTelemetry: tracing distribuido definido de forma conceitual para evolucao da instrumentacao.

## Como Executar Localmente

1. Copie as variaveis de ambiente:

```bash
cp .env.example .env
```

2. Suba todos os servicos:

```bash
docker compose up --build
```

3. Acesse:

- API Gateway: `http://localhost:3000`
- Produtos: `http://localhost:3000/products`
- Pedidos: `http://localhost:3000/orders`
- Prometheus: `http://localhost:9090`
- Jaeger: `http://localhost:16686`

## Exemplo de Pedido

Primeiro liste os produtos:

```bash
curl http://localhost:3000/products
```

Depois use o `id` de um produto:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d "{\"customerName\":\"Felipe\",\"productId\":\"COLE_AQUI_O_ID\",\"quantity\":1,\"paymentMethod\":\"credit_card\"}"
```

## Scripts

```bash
npm run lint
npm test
npm run start:gateway
npm run start:orders
npm run start:payments
npm run start:inventory
```

O script de testes usa `node tests/index.test.js`, sem `--test-isolation=none`, para manter compatibilidade com Node.js 20 no GitHub Actions.

## Kubernetes

Os manifests ficam em `k8s/`:

```bash
kubectl apply -f k8s/
```

As imagens base dos manifests usam o registry `ghcr.io/mendesfelipealmeida/...`. No pipeline de CD, antes do deploy, os manifests sao renderizados para substituir a tag fixa `1.0.0` pela tag do commit atual (`${GITHUB_SHA}`), garantindo que os Deployments usem exatamente as imagens publicadas naquele build.

## CI/CD

O workflow `.github/workflows/ci-cd.yml` executa:

- instalacao de dependencias com `npm ci`;
- lint com ESLint;
- testes automatizados em Node.js 20;
- validacao do Docker Compose;
- build e publicacao das imagens no GitHub Container Registry com tags `${GITHUB_SHA}` e `latest`;
- renderizacao dos manifests Kubernetes com `${GITHUB_SHA}`;
- deploy em Kubernetes quando a variavel `ENABLE_K8S_DEPLOY=true` estiver configurada e o secret `KUBE_CONFIG` existir.

## Case Oficial Comparado

O projeto usa como referencia concreta o case oficial GoogleCloudPlatform/microservices-demo, tambem conhecido como Online Boutique. Ele e uma aplicacao cloud-first de e-commerce em microsservicos, executavel em Kubernetes, com servicos como frontend, carrinho, catalogo, pagamento, checkout, recomendacao e load generator. A Pedidos Veloz aplica o mesmo principio em escala menor: gateway, pedidos, estoque e pagamentos, com foco em demonstrar o fluxo principal de pedidos, CI/CD, Kubernetes e observabilidade basica.

## Observabilidade

O MVP implementa metricas Prometheus em `/metrics` e logs JSON com `requestId`, metodo, rota, status e duracao. O tracing distribuido nao esta totalmente implementado no codigo: ele esta definido conceitualmente com Jaeger/OpenTelemetry como caminho de evolucao para spans entre API Gateway, Orders, Inventory e Payments.

## Entregaveis

- Parte teorica: `docs/parte-teorica.md`
- Relatorio pratico: `docs/relatorio-pratico.md`
- Roteiro do pitch: `docs/roteiro-video-pitch.md`
- Link do video no YouTube: `COLE_AQUI_O_LINK_DO_VIDEO`

## Fontes Oficiais

- Kubernetes: https://kubernetes.io/docs/
- Docker: https://docs.docker.com/
- GitHub Actions: https://docs.github.com/actions
- Terraform: https://developer.hashicorp.com/terraform/docs
- OpenTelemetry: https://opentelemetry.io/docs/
- Online Boutique: https://github.com/GoogleCloudPlatform/microservices-demo
- 12-Factor App: https://12factor.net/
