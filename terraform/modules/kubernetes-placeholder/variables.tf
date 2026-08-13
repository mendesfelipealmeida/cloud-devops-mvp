variable "project_name" {
  type = string
}

variable "region" {
  type = string
}

variable "node_count" {
  type = number
}

variable "labels" {
  type = map(string)
}
