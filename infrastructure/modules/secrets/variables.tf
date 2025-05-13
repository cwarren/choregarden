variable "name" {
  type        = string
  description = "Name of the secret (e.g., choregarden-backend-dev)"
}

variable "description" {
  type        = string
  default     = ""
  description = "Optional description of the secret"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g., dev)"
}
