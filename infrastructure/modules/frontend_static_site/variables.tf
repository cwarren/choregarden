variable "bucket_name" {
  description = "Name for the S3 bucket to host the frontend"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "dev"
}

variable "api_base_url" {
  description = "Base URL for the backend API, used by the frontend"
  type        = string
}

variable "cognito_domain" {
  description = "Cognito domain for frontend config"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito client ID for frontend config"
  type        = string
}
