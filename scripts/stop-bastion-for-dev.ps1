# Stop Bastion for Dev Script
# This script stops the bastion EC2 instance to save costs when not needed for database access.
# Resource config is loaded from dev-resource-ids.ps1 (which should be in .gitignore)

# NOTE: This script only stops the instance (preserves it for quick restart).
# It does NOT destroy the bastion infrastructure.

# NOTE: This script is designed to be run in a PowerShell environment with AWS CLI 
# installed. If translating this to work in another environment (like Bash), the commands and syntax will
# need to be adjusted accordingly.

# TO RUN:
# 1. navigate to the scripts directory
# 2. run: .\stop-bastion-for-dev.ps1

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
$bastionNameTag = $env:CHOREGARDEN_BASTION_NAME_TAG

# Auto-discover Bastion instance ID and state by Name tag
$bastionInfo = aws ec2 describe-instances --region $region --profile $awsProfile --filters "Name=tag:Name,Values=$bastionNameTag" "Name=instance-state-name,Values=running,stopped" | ConvertFrom-Json | Select-Object -ExpandProperty Reservations | ForEach-Object { $_.Instances } | Where-Object { $_ } | Select-Object -First 1

$bastionInstanceId = $bastionInfo.InstanceId
$bastionState = $bastionInfo.State.Name

Write-Host "Region: $region"
Write-Host "Profile: $awsProfile"
Write-Host "Bastion Name Tag: $bastionNameTag"
Write-Host "Bastion Instance ID: $bastionInstanceId"
Write-Host "Bastion State: $bastionState"

# Handle Bastion EC2 instance based on current state
if ($bastionInstanceId) {
    if ($bastionState -eq "stopped") {
        Write-Host ""
        Write-Host "Bastion instance is already stopped!"
        Write-Host "Instance ID: $bastionInstanceId"
        Write-Host ""
        Write-Host "To restart the bastion when needed:"
        Write-Host "  .\start-bastion-for-dev.ps1"
    } elseif ($bastionState -eq "running") {
        Write-Host ""
        Write-Host "Stopping bastion instance..."
        aws ec2 stop-instances --instance-ids $bastionInstanceId --region $region --profile $awsProfile | Out-Host
        
        Write-Host ""
        Write-Host "Bastion instance stopping successfully!"
        Write-Host "Instance ID: $bastionInstanceId"
        Write-Host ""
        Write-Host "The instance will be preserved and can be restarted quickly when needed."
        Write-Host "You will only be charged for EBS storage (~$0.80/month) while stopped."
        Write-Host ""
        Write-Host "To restart the bastion when needed:"
        Write-Host "  .\start-bastion-for-dev.ps1"
    } else {
        Write-Warning "Bastion instance is in '$bastionState' state. Cannot stop."
        Write-Host "Wait for the instance to reach 'running' state before trying to stop it."
    }
} else {
    Write-Warning "No Bastion instance found with Name tag '$bastionNameTag'"
    Write-Host ""
    Write-Host "The bastion instance (and any associated thing like a security group) needs to be created first via Terraform."
    Write-Host ""
    Write-Host "To create the bastion temporarily (without modifying terraform.tfvars):"
    Write-Host '  cd infrastructure/envs/dev'
    Write-Host '  terraform apply -var="create_bastion=true"'
    Write-Host ""
    Write-Host "Other possible issues:"
    Write-Host "- Instance doesn't have the expected Name tag: '$bastionNameTag'"
    Write-Host "- AWS CLI profile or region configuration issue"
    exit 1
}
