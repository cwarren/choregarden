terraform {
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.44.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "choregarden-dev"
  cidr = "10.0.0.0/16"

  azs = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]


  enable_nat_gateway   = var.create_nat_gateway
  single_nat_gateway   = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  map_public_ip_on_launch = true

  tags = {
    env     = "dev"
    project = "choregarden"
  }
}

module "ecr_backend" {
  source      = "../../modules/ecr_repository"
  name        = "choregarden-backend"
  environment = "dev"
}

module "backend_secret" {
  source      = "../../modules/secrets"
  name        = "choregarden-backend-dev"
  description = "Chore Garden backend secrets (dev)"
  environment = "dev"
}

module "app_backend" {
  source       = "../../modules/app_backend"
  name         = "choregarden-backend-dev"
  aws_region   = var.aws_region
  secret_arns   = [module.backend_secret.arn, module.db_secret.arn]
  image_uri    = "966559697526.dkr.ecr.us-east-1.amazonaws.com/choregarden-backend:latest"
  private_subnets = module.vpc.private_subnets
  vpc_id         = module.vpc.vpc_id
  bastion_security_group_id = module.bastion.security_group_id
}

module "db_secret" {
  source      = "../../modules/secrets"
  name        = "choregarden-db-dev"
  description = "Stores credentials and connection info for the Chore Garden dev database"
  environment = "dev"
}

module "db" {
  source = "../../modules/rds_postgres"

  name                  = "choregarden-db-dev"
  db_name               = "cgprime"
  db_instance_class     = "db.t3.micro"
  allocated_storage     = 20
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnets
  ecs_security_group_id = module.app_backend.security_group_id
  bastion_security_group_id = module.bastion.security_group_id
  environment           = "dev"
}

module "bastion" {
  source            = "../../modules/bastion"
  vpc_id            = module.vpc.vpc_id
  public_subnet_id  = module.vpc.public_subnets[0]
  ami_id            = var.bastion_ami_id
  instance_type     = var.bastion_instance_type
  key_name          = var.bastion_key_name
  allowed_ssh_cidr  = var.bastion_allowed_ssh_cidr
}

module "api_gateway" {
  source                = "../../modules/api_gateway"
  vpc_link_id           = aws_apigatewayv2_vpc_link.backend.id
  nlb_arn               = module.app_backend.nlb_arn
  nlb_listener_arn      = module.app_backend.nlb_listener_arn
  cognito_user_pool_arn = module.cognito.user_pool_arn
  cognito_user_pool_client_id = module.cognito.user_pool_client_id
  cognito_user_pool_id  = module.cognito.user_pool_id
  aws_region            = var.aws_region
}

module "frontend_static_site" {
  source      = "../../modules/frontend_static_site"
  bucket_name = "choregarden-frontend-dev"
  environment = "dev"
  api_base_url = module.api_gateway.http_api_url
  cognito_domain = module.cognito.domain
  cognito_client_id = module.cognito.user_pool_client_id
}

module "github_oidc" {
  source              = "../../modules/iam_github_oidc"
  github_org          = "cwarren"
  github_repository   = "choregarden"
  environment         = "dev"
  role_name_prefix    = "github-actions"
  allowed_branches    = ["dev", "main"]
  s3_buckets          = [module.frontend_static_site.s3_bucket_name]
  ecr_repositories    = [module.ecr_backend.repository_name]
  cloudfront_distributions = [module.frontend_static_site.cloudfront_distribution_id]
  terraform_state_bucket = "choregarden-terraform-state-dev"
  terraform_state_key_prefix = "envs/dev/"
}

module "cognito" {
  source        = "../../modules/cognito"
  name          = "choregarden-dev"
  domain_prefix = "choregarden-dev-${random_id.cognito_domain.hex}"
  aws_region    = var.aws_region
  callback_urls = [
    "http://localhost:3000/",
    "https://${module.frontend_static_site.cloudfront_url}/"
  ]
  logout_urls   = [
    "http://localhost:3000/",
    "https://${module.frontend_static_site.cloudfront_url}/"
  ]
}

resource "random_id" "cognito_domain" {
  byte_length = 4
}

resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type = "Interface"
  subnet_ids        = module.vpc.private_subnets
  security_group_ids = [module.app_backend.security_group_id]

  private_dns_enabled = true

  tags = {
    Name = "choregarden-secretsmanager-endpoint"
    env  = "dev"
  }
}

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.ecr.api"
  vpc_endpoint_type = "Interface"
  subnet_ids        = module.vpc.private_subnets
  security_group_ids = [module.app_backend.security_group_id]
  private_dns_enabled = true
  tags = {
    Name = "choregarden-ecr-api-endpoint"
    env  = "dev"
  }
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.ecr.dkr"
  vpc_endpoint_type = "Interface"
  subnet_ids        = module.vpc.private_subnets
  security_group_ids = [module.app_backend.security_group_id]
  private_dns_enabled = true
  tags = {
    Name = "choregarden-ecr-dkr-endpoint"
    env  = "dev"
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = module.vpc.private_route_table_ids
  tags = {
    Name = "choregarden-s3-endpoint"
    env  = "dev"
  }
}

resource "aws_vpc_endpoint" "logs" {
  vpc_id             = module.vpc.vpc_id
  service_name       = "com.amazonaws.${var.aws_region}.logs"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = module.vpc.private_subnets
  security_group_ids = [module.app_backend.security_group_id]
  private_dns_enabled = true
  tags = {
    Name = "choregarden-logs-endpoint"
    env  = "dev"
  }
}

resource "aws_apigatewayv2_vpc_link" "backend" {
  name               = "choregarden-backend-vpc-link"
  subnet_ids         = module.vpc.private_subnets
  security_group_ids = [module.app_backend.security_group_id]
  tags = {
    env = "dev"
    project = "choregarden"
  }
}

resource "aws_s3_bucket" "db_migrations" {
  bucket = "choregarden-db-migrations"
  force_destroy = true
  tags = {
    project = "choregarden"
    purpose = "db-migrations"
  }
}

resource "aws_ecr_repository" "migration_lambda" {
  name = "migration-lambda"
  image_tag_mutability = "MUTABLE"
  force_delete = true
}

resource "aws_iam_role" "migration_lambda" {
  name = "migration-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "migration_lambda_policy" {
  role = aws_iam_role.migration_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:GetObject"],
        Resource = ["${aws_s3_bucket.db_migrations.arn}/*"]
      },
      {
        Effect = "Allow"
        Action = ["s3:ListBucket"],
        Resource = "${aws_s3_bucket.db_migrations.arn}"
      },
      {
        Effect = "Allow"
        Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"],
        Resource = module.db_secret.arn
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeVpcs",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups"
        ],
        Resource = "*"
      }
    ]
  })
}

variable "migration_lambda_image_tag" {
  description = "ECR image tag for the migration Lambda (should be immutable, e.g., commit SHA)"
  type        = string
  default     = "latest"
}

data "aws_ecr_image" "migration_lambda" {
  repository_name = aws_ecr_repository.migration_lambda.name
  image_tag       = var.migration_lambda_image_tag
}

resource "aws_lambda_function" "migration_lambda" {
  function_name = "flyway-migration"
  role          = aws_iam_role.migration_lambda.arn
  package_type  = "Image"
  image_uri     = data.aws_ecr_image.migration_lambda.image_uri
  timeout       = 900
  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [module.app_backend.security_group_id]
  }
  environment {
    variables = {
      MIGRATION_S3_BUCKET = aws_s3_bucket.db_migrations.bucket
      MIGRATION_S3_PREFIX = "migrations/"
      RDS_ENDPOINT        = module.db.endpoint
      DB_SECRET_ARN       = module.db_secret.arn
    }
  }
  depends_on = [aws_iam_role_policy.migration_lambda_policy]
}

output "bastion_public_ip" {
  description = "Public IP of the Bastion host for SSH access"
  value       = module.bastion.public_ip
}

output "http_api_url" {
  description = "Invoke URL for the HTTP API"
  value       = module.api_gateway.http_api_url
}

output "frontend_s3_bucket_name" {
  description = "S3 bucket name for the frontend static site"
  value       = module.frontend_static_site.s3_bucket_name
}

output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions IAM role"
  value       = module.github_oidc.deployment_role_arn
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC identity provider"
  value       = module.github_oidc.oidc_provider_arn
}
