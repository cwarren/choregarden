variable "name" {
  description = "Unique name for the RDS instance and related resources"
  type        = string
}

variable "db_name" {
  description = "Database name to create"
  type        = string
}

variable "db_instance_class" {
  description = "Instance class for RDS (e.g., db.t3.micro)"
  type        = string
}

variable "allocated_storage" {
  description = "Storage in GB"
  type        = number
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_security_group_id" {
  type = string
}

variable "environment" {
  type    = string
  default = "dev"
}
