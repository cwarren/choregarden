variable "name" {
  description = "Base name for ECS and logs"
  type        = string
}

variable "secret_arns" {
  description = "List of ARNs for secrets to be accessible by ECS task"
  type        = list(string)
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "image_uri" {
  type        = string
  description = "Full image URI (ECR repo + tag)"
}

variable "public_subnets" {
  type        = list(string)
  description = "List of public subnet IDs for ECS networking"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID to attach security groups"
}
