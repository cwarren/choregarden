output "cognito_login_url" {
  value = module.cognito.login_url
  description = "The Cognito Managed UI login URL for the user pool client."
}
