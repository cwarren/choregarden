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
  integration_uri        = var.nlb_listener_arn # Use the NLB listener ARN as required by AWS
}

resource "aws_apigatewayv2_route" "ping" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /api/ping"
  target    = "integrations/${aws_apigatewayv2_integration.backend_vpc.id}"
}

resource "aws_apigatewayv2_route" "pingdeep" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /api/pingdeep"
  target    = "integrations/${aws_apigatewayv2_integration.backend_vpc.id}"
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

resource "aws_apigatewayv2_route" "pingprotected" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /api/pingprotected"
  target    = "integrations/${aws_apigatewayv2_integration.backend_vpc.id}"
  authorizer_id = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "pingprotected_options" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "OPTIONS /api/pingprotected"
  target    = "integrations/${aws_apigatewayv2_integration.backend_vpc.id}"
}

output "http_api_url" {
  description = "Invoke URL for the HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}