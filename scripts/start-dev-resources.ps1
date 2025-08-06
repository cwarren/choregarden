# Start Dev Resources Script
# This script starts all dev resources: re-creates VPC interface endpoints (via Terraform),
# starts RDS, and ECS backend.
# Resource config is loaded from dev-resource-ids.ps1 (which should be in .gitignore)

# NOTE: this is intended to be run after `stop-dev-resources.ps1` to bring the dev environment
# back up. This is NOT a full environment setup script. It assumes the infrastructure is already
# set up and just needs to be started.

# NOTE: This script is designed to be run in a PowerShell environment with AWS CLI and Terraform 
# installed. If translating this to work in another environment (like Bash), the commands and syntax will
# need to be adjusted accordingly.

# NOTE: For bastion instance management, use the separate `start-bastion-for-dev.ps1` script.

# TO RUN:
# 1. navigate to the scripts directory
# 2. run: .\start-dev-resources.ps1

$idsPath = Join-Path $PSScriptRoot 'dev-resource-ids.ps1'
if (Test-Path $idsPath) {
    # Load the config file to set environment variables
    Get-Content $idsPath | Out-String | Invoke-Expression
} else {
    Write-Error "Missing dev-resource-ids.ps1. Please create it with your resource IDs."
    exit 1
}

# Assign config values to local variables for clarity
$region = $env:CHOREGARDEN_REGION
$awsProfile = $env:CHOREGARDEN_PROFILE
$rdsInstanceId = $env:CHOREGARDEN_RDS_INSTANCE_ID
$ecsCluster = $env:CHOREGARDEN_ECS_CLUSTER
$ecsService = $env:CHOREGARDEN_ECS_SERVICE

Write-Host "Region: $region"
Write-Host "Profile: $awsProfile"
Write-Host "RDS Instance ID: $rdsInstanceId"
Write-Host "ECS Cluster: $ecsCluster"
Write-Host "ECS Service: $ecsService"

# 1. Re-create VPC endpoints, VPC Link, NLB, and API Gateway integrations/routes with Terraform
$env:AWS_PROFILE = $awsProfile
cd $PSScriptRoot/../infrastructure/envs/dev
terraform apply -auto-approve `
  "-target=aws_vpc_endpoint.secretsmanager" `
  "-target=aws_vpc_endpoint.ecr_api" `
  "-target=aws_vpc_endpoint.ecr_dkr" `
  "-target=aws_vpc_endpoint.logs" `
  "-target=aws_apigatewayv2_vpc_link.backend" `
  "-target=module.app_backend.aws_lb.backend_nlb" `
  "-target=module.app_backend.aws_lb_target_group.backend" `
  "-target=module.app_backend.aws_lb_listener.backend" `
  "-target=module.api_gateway.aws_apigatewayv2_integration.backend_vpc" `
  "-target=module.api_gateway.aws_apigatewayv2_route.public" `
  "-target=module.api_gateway.aws_apigatewayv2_route.protected" `
  "-target=module.api_gateway.aws_apigatewayv2_route.options"
cd $PSScriptRoot

# 2. Start RDS instance
aws rds start-db-instance --db-instance-identifier $rdsInstanceId --region $region --profile $awsProfile | Out-Host

# 3. Scale up ECS service
aws ecs update-service --cluster $ecsCluster --service $ecsService --desired-count 1 --region $region --profile $awsProfile | Out-Host

Write-Host "Dev resources started successfully!"
Write-Host "- VPC endpoints and API Gateway routes: Created/Updated"
Write-Host "- RDS instance: Starting"
Write-Host "- ECS service: Scaled to 1 instance"
Write-Host ""
Write-Host "To start the bastion instance for database access, run: .\start-bastion-for-dev.ps1"
