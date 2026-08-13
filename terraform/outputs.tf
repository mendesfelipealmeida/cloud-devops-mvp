output "cluster_name" {
  description = "Nome do cluster Kubernetes provisionado."
  value       = module.kubernetes_cluster.cluster_name
}

output "registry_url" {
  description = "URL do registry de imagens."
  value       = module.container_registry.registry_url
}
