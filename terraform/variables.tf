variable "project_name" {
  description = "Nome logico do projeto."
  type        = string
  default     = "pedidos-veloz"
}

variable "environment" {
  description = "Ambiente alvo."
  type        = string
  default     = "production"
}

variable "region" {
  description = "Regiao cloud onde os recursos serao criados."
  type        = string
  default     = "us-east-1"
}

variable "node_count" {
  description = "Quantidade inicial de nodes no cluster."
  type        = number
  default     = 3
}
