output "user_pool_id" {
  value = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.this.arn
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "login_url" {
  value       = "${aws_cognito_user_pool_domain.this.domain}.auth.${var.aws_region}.amazoncognito.com/login?client_id=${aws_cognito_user_pool_client.this.id}&response_type=code&scope=email+openid+profile&redirect_uri=${var.callback_urls[0]}"
  description = "The full Cognito Managed UI login URL (using the first callback URL)."
}

output "domain" {
  value       = "${aws_cognito_user_pool_domain.this.domain}.auth.${var.aws_region}.amazoncognito.com"
  description = "The Cognito domain for frontend config (no https:// prefix)."
}
