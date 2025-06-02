# Start Dev Resources Script
# This script starts all dev resources: re-creates VPC interface endpoints (via Terraform), starts RDS, ECS backend, and Bastion EC2 instance.
# Resource config is loaded from dev-resource-ids.ps1 (which should be in .gitignore)

$idsPath = Join-Path $PSScriptRoot 'dev-resource-ids.ps1'
if (Test-Path $idsPath) {
    $config = Get-Content $idsPath | Out-String | Invoke-Expression
} else {
    Write-Error "Missing dev-resource-ids.ps1. Please create it with your resource IDs."
    exit 1
}

# Assign config values to local variables for clarity
$region = $env:CHOREGARDEN_REGION
$profile = $env:CHOREGARDEN_PROFILE
$rdsInstanceId = $env:CHOREGARDEN_RDS_INSTANCE_ID
$ecsCluster = $env:CHOREGARDEN_ECS_CLUSTER
$ecsService = $env:CHOREGARDEN_ECS_SERVICE

# Auto-discover Bastion instance ID by Name tag
$bastionNameTag = $env:CHOREGARDEN_BASTION_NAME_TAG
$bastionInstanceId = aws ec2 describe-instances --region $region --profile $profile --filters "Name=tag:Name,Values=$bastionNameTag" "Name=instance-state-name,Values=running,stopped" | ConvertFrom-Json | Select-Object -ExpandProperty Reservations | ForEach-Object { $_.Instances } | Where-Object { $_ } | Select-Object -First 1 -ExpandProperty InstanceId

Write-Host "Region: $region"
Write-Host "Profile: $profile"
Write-Host "RDS Instance ID: $rdsInstanceId"
Write-Host "ECS Cluster: $ecsCluster"
Write-Host "ECS Service: $ecsService"
Write-Host "Bastion Name Tag: $bastionNameTag"
Write-Host "Bastion Instance ID: $bastionInstanceId"

# 1. Re-create VPC endpoints with Terraform
$env:AWS_PROFILE = $profile
cd $PSScriptRoot/../infrastructure/envs/dev
terraform apply -auto-approve
cd $PSScriptRoot

# 2. Start RDS instance
aws rds start-db-instance --db-instance-identifier $rdsInstanceId --region $region --profile $profile

# 3. Scale up ECS service
aws ecs update-service --cluster $ecsCluster --service $ecsService --desired-count 1 --region $region --profile $profile

# 4. Start Bastion EC2 instance
if ($bastionInstanceId) {
    aws ec2 start-instances --instance-ids $bastionInstanceId --region $region --profile $profile
} else {
    Write-Warning "No Bastion instance found with Name tag '$bastionNameTag'"
}
