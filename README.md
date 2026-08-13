# Pedidos Veloz - Cloud DevOps MVP

Plataforma de pedidos em microsservicos para o desafio de Cloud DevOps. O projeto demonstra ambiente local com Docker Compose, conteinerizacao, Kubernetes, CI/CD, observabilidade e esqueleto de IaC com Terraform.

## Arquitetura

- API Gateway: entrada HTTP unica para clientes.
- Orders Service: cria e consulta pedidos.
- Payments Service: simula autorizacao de pagamento externo.
- Inventory Service: lista produtos e reserva estoque.
- PostgreSQL: banco relacional da plataforma.
- Prometheus: coleta metricas expostas em `/metrics`.
- Jaeger: ponto de apoio para tracing distribuido conceitual/instrumentavel.

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
npm test
npm run start:gateway
npm run start:orders
npm run start:payments
npm run start:inventory
```

## Kubernetes

Os manifests ficam em `k8s/`:

```bash
kubectl apply -f k8s/
```

Antes de usar em um registry real, substitua `ghcr.io/SEU_USUARIO/...` pelas imagens publicadas pelo pipeline.

## CI/CD

O workflow `.github/workflows/ci-cd.yml` executa:

- instalacao de dependencias;
- testes automatizados;
- validacao do Docker Compose;
- build e publicacao das imagens no GitHub Container Registry;
- deploy em Kubernetes usando o secret `KUBE_CONFIG`.

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
- 12-Factor App: https://12factor.net/
