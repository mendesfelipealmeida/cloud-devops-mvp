# Terraform - Esqueleto de Infraestrutura

Este diretorio demonstra como a infraestrutura da Pedidos Veloz pode ser reproduzida como codigo.

O trabalho nao depende de uma conta cloud real para executar o MVP local, por isso os recursos abaixo ficam como esqueleto:

- `variables.tf`: parametros reutilizaveis por ambiente.
- `main.tf`: estrutura base para cluster Kubernetes gerenciado, registry e banco.
- `outputs.tf`: saidas esperadas para conectar o pipeline ao cluster.

Em producao, este esqueleto pode ser adaptado para AWS EKS, Azure AKS, Google GKE ou outro provedor.
