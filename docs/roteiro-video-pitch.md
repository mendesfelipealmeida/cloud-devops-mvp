# Roteiro do Video Pitch - ate 4 minutos

## 0:00 - 0:30 | Contexto

Apresentar o problema da Loja Veloz: deploys arriscados, dificuldade de escalar e pouca rastreabilidade entre servicos. Explicar que a solucao proposta e um MVP cloud-native chamado Pedidos Veloz.

## 0:30 - 1:15 | Arquitetura

Mostrar o README e explicar os componentes:

- API Gateway como entrada HTTP.
- Orders Service para criar e consultar pedidos.
- Inventory Service para produtos e reserva de estoque.
- Payments Service como simulacao de integracao externa.
- PostgreSQL como banco.
- Prometheus e Jaeger para observabilidade.

## 1:15 - 2:00 | Demonstracao local

Mostrar o comando:

```bash
docker compose up --build
```

Abrir:

- `http://localhost:3000`
- `http://localhost:3000/products`

Criar um pedido via Postman, Insomnia ou curl:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d "{\"customerName\":\"Felipe\",\"productId\":\"ID_DO_PRODUTO\",\"quantity\":1,\"paymentMethod\":\"credit_card\"}"
```

## 2:00 - 2:45 | Containers e Kubernetes

Mostrar o `Dockerfile` e destacar:

- multi-stage;
- imagem `node:20-alpine`;
- usuario nao-root;
- comando separado por servico.

Mostrar a pasta `k8s/` e explicar:

- Deployments e Services;
- ConfigMap e Secret;
- probes de saude;
- RollingUpdate;
- HPA.

## 2:45 - 3:20 | CI/CD

Mostrar `.github/workflows/ci-cd.yml`:

- testes;
- validacao do Compose;
- build e push de imagens;
- deploy com `kubectl`.

Explicar o uso de secrets como `KUBE_CONFIG`.

## 3:20 - 3:50 | Observabilidade, escala e resiliencia

Mostrar `/metrics` ou Prometheus. Explicar logs JSON com `requestId` e tracing distribuido com OpenTelemetry/Jaeger como evolucao instrumentada.

Explicar por que RollingUpdate e HPA foram escolhidos para reduzir risco e responder a picos de trafego.

## 3:50 - 4:00 | Fechamento

Concluir que a proposta padroniza o ambiente local, automatiza build/deploy, prepara Kubernetes para producao minima e melhora diagnostico operacional.

Link do video: `COLE_AQUI_O_LINK_DO_VIDEO`
