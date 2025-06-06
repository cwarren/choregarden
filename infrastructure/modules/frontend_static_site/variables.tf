variable "bucket_name" {
  description = "Name for the S3 bucket to host the frontend"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "dev"
}
