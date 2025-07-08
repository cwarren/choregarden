locals {
  # Public routes (no auth required)
  public_routes = {
    ping     = "GET /api/ping"
    pingdeep = "GET /api/pingdeep"
  }

  # Protected routes (require Cognito auth)
  protected_routes = {
    pingprotected = "GET /api/pingprotected"
    register_user = "POST /api/user/register"
    get_profile   = "GET /api/user/profile"
    update_profile = "PUT /api/user/profile"
  }

  # OPTIONS routes for CORS
  options_routes = {
    pingprotected_options = "OPTIONS /api/pingprotected"
    user_register_options = "OPTIONS /api/user/register"
    user_profile_options  = "OPTIONS /api/user/profile"
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "choregarden-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "backend_vpc" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "HTTP_PROXY"
  integration_method     = "ANY"
  connection_type        = "VPC_LINK"
  connection_id          = var.vpc_link_id
  payload_format_version = "1.0"
  integration_uri        = var.nlb_listener_arn
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.http_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"
  jwt_configuration {
    audience = [var.cognito_user_pool_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

# Public routes
resource "aws_apigatewayv2_route" "public" {
  for_each  = local.public_routes
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = each.value
  target    = "integrations/${aws_apigatewayv2_integration.backend_vpc.id}"
}

# Protected routes
resource "aws_apigatewayv2_route" "protected" {
  for_each           = local.protected_routes
  api_id             = aws_apigatewayv2_api.http_api.id
  route_key          = each.value
  target             = "integrations/${aws_apigatewayv2_integration.backend_vpc.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

# OPTIONS routes for CORS
resource "aws_apigatewayv2_route" "options" {
  for_each  = local.options_routes
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = each.value
  target    = "integrations/${aws_apigatewayv2_integration.backend_vpc.id}"
}

output "http_api_url" {
  description = "Invoke URL for the HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}