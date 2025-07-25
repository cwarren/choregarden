output "oidc_provider_arn" {
  description = "ARN of the GitHub OIDC identity provider"
  value       = aws_iam_openid_connect_provider.github.arn
}

output "deployment_role_arn" {
  description = "ARN of the GitHub Actions deployment role"
  value       = aws_iam_role.github_actions.arn
}

output "deployment_role_name" {
  description = "Name of the GitHub Actions deployment role"
  value       = aws_iam_role.github_actions.name
}

output "oidc_provider_url" {
  description = "URL of the GitHub OIDC identity provider"
  value       = aws_iam_openid_connect_provider.github.url
}
