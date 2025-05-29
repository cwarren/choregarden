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

output "bastion_public_ip" {
  description = "Public IP of the Bastion host for SSH access"
  value       = module.bastion.public_ip
}
