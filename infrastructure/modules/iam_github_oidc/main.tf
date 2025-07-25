# Data source to get current AWS account ID and region
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Create the GitHub OIDC identity provider
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
  
  client_id_list = [
    "sts.amazonaws.com"
  ]
  
  # NOTE: these are public certificate fingerprints - NOT sensitive information
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",  # GitHub Actions OIDC thumbprint
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"   # Backup thumbprint
  ]

  tags = {
    Name        = "github-actions-oidc-${var.environment}"
    Environment = var.environment
    Project     = "choregarden"
  }
}

# Create the IAM role that GitHub Actions will assume
resource "aws_iam_role" "github_actions" {
  name = "${var.role_name_prefix}-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = [
              for branch in var.allowed_branches :
              "repo:${var.github_org}/${var.github_repository}:ref:refs/heads/${branch}"
            ]
          }
        }
      }
    ]
  })

  tags = {
    Name        = "${var.role_name_prefix}-${var.environment}"
    Environment = var.environment
    Project     = "choregarden"
  }
}

# S3 permissions for deployment
resource "aws_iam_policy" "s3_deployment" {
  count = length(var.s3_buckets) > 0 ? 1 : 0
  
  name        = "${var.role_name_prefix}-s3-${var.environment}"
  description = "S3 permissions for GitHub Actions deployment"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:GetBucketVersioning"
        ]
        Resource = flatten([
          [for bucket in var.s3_buckets : "arn:aws:s3:::${bucket}"],
          [for bucket in var.s3_buckets : "arn:aws:s3:::${bucket}/*"]
        ])
      }
    ]
  })
}

# ECR permissions for container deployment
resource "aws_iam_policy" "ecr_deployment" {
  count = length(var.ecr_repositories) > 0 ? 1 : 0
  
  name        = "${var.role_name_prefix}-ecr-${var.environment}"
  description = "ECR permissions for GitHub Actions deployment"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = [
          for repo in var.ecr_repositories :
          "arn:aws:ecr:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:repository/${repo}"
        ]
      }
    ]
  })
}

# ECS permissions for service deployment
resource "aws_iam_policy" "ecs_deployment" {
  count = length(var.ecs_clusters) > 0 || length(var.ecs_services) > 0 ? 1 : 0
  
  name        = "${var.role_name_prefix}-ecs-${var.environment}"
  description = "ECS permissions for GitHub Actions deployment"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTasks",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:DeregisterTaskDefinition",
          "ecs:ListTasks",
          "ecs:StopTask"
        ]
        Resource = flatten([
          [for cluster in var.ecs_clusters : "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:cluster/${cluster}"],
          [for cluster in var.ecs_clusters : [for service in var.ecs_services : "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:service/${cluster}/${service}"]],
          ["arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:task-definition/*:*"]
        ])
      }
    ]
  })
}

# Lambda permissions for function deployment
resource "aws_iam_policy" "lambda_deployment" {
  count = length(var.lambda_functions) > 0 ? 1 : 0
  
  name        = "${var.role_name_prefix}-lambda-${var.environment}"
  description = "Lambda permissions for GitHub Actions deployment"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:GetFunction",
          "lambda:InvokeFunction"
        ]
        Resource = [
          for func in var.lambda_functions :
          "arn:aws:lambda:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:function:${func}"
        ]
      }
    ]
  })
}

# IAM PassRole permissions for ECS (restricted to specific roles)
resource "aws_iam_policy" "ecs_pass_role" {
  count = length(var.ecs_task_execution_roles) > 0 || length(var.ecs_task_roles) > 0 ? 1 : 0
  
  name        = "${var.role_name_prefix}-ecs-pass-role-${var.environment}"
  description = "IAM PassRole permissions for ECS tasks"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = flatten([
          [for role in var.ecs_task_execution_roles : "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${role}"],
          [for role in var.ecs_task_roles : "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${role}"]
        ])
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "ecs-tasks.amazonaws.com"
          }
        }
      }
    ]
  })
}

# CloudFront permissions for cache invalidation
resource "aws_iam_policy" "cloudfront_deployment" {
  count = length(var.cloudfront_distributions) > 0 ? 1 : 0
  
  name        = "${var.role_name_prefix}-cloudfront-${var.environment}"
  description = "CloudFront permissions for GitHub Actions deployment"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = [
          for dist in var.cloudfront_distributions :
          "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${dist}"
        ]
      }
    ]
  })
}

# Terraform state permissions (if role needs to run terraform)
resource "aws_iam_policy" "terraform_state" {
  count = var.terraform_state_bucket != "" ? 1 : 0
  
  name        = "${var.role_name_prefix}-terraform-${var.environment}"
  description = "Terraform state permissions for GitHub Actions"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          var.terraform_state_key_prefix != "" ? 
          "arn:aws:s3:::${var.terraform_state_bucket}/${var.terraform_state_key_prefix}*" :
          "arn:aws:s3:::${var.terraform_state_bucket}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = "arn:aws:s3:::${var.terraform_state_bucket}"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/terraform-state-lock"
      }
    ]
  })
}

# Additional Terraform permissions for managing AWS resources
resource "aws_iam_policy" "terraform_operations" {
  count = var.terraform_state_bucket != "" ? 1 : 0
  
  name        = "${var.role_name_prefix}-terraform-ops-${var.environment}"
  description = "Additional permissions for Terraform operations"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          # S3 object management for config files (restricted to deployment buckets)
          "s3:PutObjectAcl",
          "s3:GetObjectVersion",
          "s3:GetBucketAcl",
          "s3:GetBucketPolicy",
          "s3:PutBucketPolicy",
          "s3:GetBucketVersioning",
          "s3:PutBucketVersioning",
          "s3:GetBucketLogging",
          "s3:PutBucketLogging"
        ]
        Resource = flatten([
          [for bucket in var.s3_buckets : "arn:aws:s3:::${bucket}"],
          [for bucket in var.s3_buckets : "arn:aws:s3:::${bucket}/*"]
        ])
      },
      {
        Effect = "Allow"
        Action = [
          # CloudFront for distribution management (restricted to specified distributions)
          "cloudfront:GetDistribution",
          "cloudfront:GetDistributionConfig",
          "cloudfront:UpdateDistribution",
          "cloudfront:TagResource",
          "cloudfront:UntagResource",
          "cloudfront:ListTagsForResource"
        ]
        Resource = [
          for dist in var.cloudfront_distributions :
          "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${dist}"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          # Basic resource tagging (restricted to deployment-related resources)
          "tag:GetResources",
          "tag:TagResources", 
          "tag:UntagResources"
        ]
        Resource = flatten([
          [for bucket in var.s3_buckets : "arn:aws:s3:::${bucket}"],
          [for bucket in var.s3_buckets : "arn:aws:s3:::${bucket}/*"],
          [for dist in var.cloudfront_distributions : "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${dist}"]
        ])
      }
    ]
  })
}

# Attach policies to the role
resource "aws_iam_role_policy_attachment" "s3_deployment" {
  count      = length(var.s3_buckets) > 0 ? 1 : 0
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.s3_deployment[0].arn
}

resource "aws_iam_role_policy_attachment" "ecr_deployment" {
  count      = length(var.ecr_repositories) > 0 ? 1 : 0
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.ecr_deployment[0].arn
}

resource "aws_iam_role_policy_attachment" "ecs_deployment" {
  count      = length(var.ecs_clusters) > 0 || length(var.ecs_services) > 0 ? 1 : 0
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.ecs_deployment[0].arn
}

resource "aws_iam_role_policy_attachment" "ecs_pass_role" {
  count      = length(var.ecs_task_execution_roles) > 0 || length(var.ecs_task_roles) > 0 ? 1 : 0
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.ecs_pass_role[0].arn
}

resource "aws_iam_role_policy_attachment" "lambda_deployment" {
  count      = length(var.lambda_functions) > 0 ? 1 : 0
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.lambda_deployment[0].arn
}

resource "aws_iam_role_policy_attachment" "cloudfront_deployment" {
  count      = length(var.cloudfront_distributions) > 0 ? 1 : 0
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.cloudfront_deployment[0].arn
}

resource "aws_iam_role_policy_attachment" "terraform_state" {
  count      = var.terraform_state_bucket != "" ? 1 : 0
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.terraform_state[0].arn
}

resource "aws_iam_role_policy_attachment" "terraform_operations" {
  count      = var.terraform_state_bucket != "" ? 1 : 0
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.terraform_operations[0].arn
}
