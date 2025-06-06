variable "vpc_link_id" {
  description = "The ID of the API Gateway VPC Link to use for backend integration"
  type        = string
}

variable "nlb_arn" {
  description = "The ARN of the backend NLB for API Gateway integration"
  type        = string
}

variable "nlb_listener_arn" {
  description = "The ARN of the backend NLB listener for API Gateway integration"
  type        = string
}