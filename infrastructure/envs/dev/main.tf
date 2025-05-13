terraform {
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
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

  azs             = ["us-east-1a"]
  public_subnets  = ["10.0.101.0/24"]
  private_subnets = ["10.0.1.0/24"]

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
  secret_arn   = module.backend_secret.arn
  image_uri    = "966559697526.dkr.ecr.us-east-1.amazonaws.com/choregarden-backend:latest"
  public_subnets = module.vpc.public_subnets
  vpc_id         = module.vpc.vpc_id
}
