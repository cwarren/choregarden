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

variable "cognito_user_pool_arn" {
  description = "The ARN of the Cognito User Pool for authorizer."
  type        = string
}

variable "cognito_user_pool_client_id" {
  description = "The client ID of the Cognito User Pool client."
  type        = string
}

variable "cognito_user_pool_id" {
  description = "The ID of the Cognito User Pool for authorizer."
  type        = string
}

variable "aws_region" {
  description = "AWS region for the Cognito user pool."
  type        = string
}