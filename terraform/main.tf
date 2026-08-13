terraform {
  required_version = ">= 1.6.0"
}

# Esqueleto propositalmente independente de provedor.
# Para uma entrega real, substituir por modulos oficiais do provedor escolhido:
# AWS EKS, Azure AKS, Google GKE ou Kubernetes em infraestrutura propria.

locals {
  labels = {
    project     = var.project_name
    environment = var.environment
  }
}

module "network" {
  source = "./modules/network-placeholder"

  project_name = var.project_name
  region       = var.region
  labels       = local.labels
}

module "kubernetes_cluster" {
  source = "./modules/kubernetes-placeholder"

  project_name = var.project_name
  region       = var.region
  node_count   = var.node_count
  labels       = local.labels
}

module "container_registry" {
  source = "./modules/registry-placeholder"

  project_name = var.project_name
  labels       = local.labels
}
