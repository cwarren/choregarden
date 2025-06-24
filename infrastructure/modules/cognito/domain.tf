resource "aws_cognito_user_pool_domain" "this" {
  domain       = var.domain_prefix
  user_pool_id = aws_cognito_user_pool.this.id
}

variable "domain_prefix" {
  description = "Prefix for the AWS-provided Cognito domain (must be globally unique)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for the Cognito domain URL."
  type        = string
}

output "domain_url" {
  value = "https://${aws_cognito_user_pool_domain.this.domain}.auth.${var.aws_region}.amazoncognito.com"
  description = "The Cognito managed login (hosted UI) domain URL."
}
