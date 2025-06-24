resource "aws_cognito_user_pool" "this" {
  name = var.name

  auto_verified_attributes = ["email"]
  username_attributes     = ["email"]
  mfa_configuration       = "OFF"

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    temporary_password_validity_days = 7
  }

  schema {
    name = "email"
    developer_only_attribute = false
    required = true
    attribute_data_type = "String"
    mutable = true
  }

  schema {
    name = "name"
    developer_only_attribute = false
    required = false
    attribute_data_type = "String"
    mutable = true
    string_attribute_constraints {}
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.name}-client"
  user_pool_id = aws_cognito_user_pool.this.id
  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_CUSTOM_AUTH"
  ]
  supported_identity_providers = ["COGNITO"]
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls
  prevent_user_existence_errors = "ENABLED"

  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["openid", "email", "profile"]
  allowed_oauth_flows_user_pool_client = true
}
