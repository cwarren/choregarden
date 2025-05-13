variable "name" {
  description = "Base name for ECS and logs"
  type        = string
}

variable "secret_arn" {
  description = "ARN of the secret to inject"
  type        = string
}
