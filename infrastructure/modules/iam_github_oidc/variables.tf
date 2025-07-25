variable "github_org" {
  description = "GitHub organization name"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository name"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "role_name_prefix" {
  description = "Prefix for IAM role names"
  type        = string
  default     = "github-actions"
}

variable "allowed_branches" {
  description = "List of branches that can assume the role"
  type        = list(string)
  default     = ["main", "dev"]
}

variable "s3_buckets" {
  description = "List of S3 bucket names that the role should have access to"
  type        = list(string)
  default     = []
}

variable "ecr_repositories" {
  description = "List of ECR repository names that the role should have access to"
  type        = list(string)
  default     = []
}

variable "ecs_clusters" {
  description = "List of ECS cluster names that the role should have access to"
  type        = list(string)
  default     = []
}

variable "ecs_services" {
  description = "List of ECS service names that the role should have access to"
  type        = list(string)
  default     = []
}

variable "rds_instances" {
  description = "List of RDS instance identifiers that the role should have access to"
  type        = list(string)
  default     = []
}

variable "lambda_functions" {
  description = "List of Lambda function names that the role should have access to"
  type        = list(string)
  default     = []
}

variable "terraform_state_bucket" {
  description = "S3 bucket name for Terraform state (if role needs to run terraform)"
  type        = string
  default     = ""
}

variable "terraform_state_key_prefix" {
  description = "Prefix for Terraform state keys"
  type        = string
  default     = ""
}

variable "cloudfront_distributions" {
  description = "List of CloudFront distribution IDs that the role should have access to"
  type        = list(string)
  default     = []
}
