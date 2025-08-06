# Start Bastion for Dev Script
# This script starts the bastion EC2 instance for database access during development.
# Resource config is loaded from dev-resource-ids.ps1 (which should be in .gitignore)

# NOTE: This script assumes the bastion infrastructure is already set up via Terraform.
# It only starts the existing bastion instance.

# NOTE: This script is designed to be run in a PowerShell environment with AWS CLI 
# installed. If translating this to work in another environment (like Bash), the commands and syntax will
# need to be adjusted accordingly.

# TO RUN:
# 1. navigate to the scripts directory
# 2. run: .\start-bastion-for-dev.ps1

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
$bastionPublicIp = $bastionInfo.PublicIpAddress

Write-Host "Region: $region"
Write-Host "Profile: $awsProfile"
Write-Host "Bastion Name Tag: $bastionNameTag"
Write-Host "Bastion Instance ID: $bastionInstanceId"
Write-Host "Bastion State: $bastionState"

# Handle Bastion EC2 instance based on current state
if ($bastionInstanceId) {
    if ($bastionState -eq "running") {
        Write-Host ""
        Write-Host "Bastion instance is already running!"
        Write-Host "Instance ID: $bastionInstanceId"
        Write-Host "Public IP: $bastionPublicIp"
        Write-Host ""
        Write-Host "To connect to the bastion for database access:"
        Write-Host "1. Use AWS Systems Manager Session Manager to connect"
        Write-Host "2. Or use SSH if you have the key pair configured"
        Write-Host "   ssh -i ~/.ssh/choregarden-bastion-dev.pem ec2-user@$bastionPublicIp"
    } elseif ($bastionState -eq "stopped") {
        Write-Host "Starting bastion instance..."
        aws ec2 start-instances --instance-ids $bastionInstanceId --region $region --profile $awsProfile | Out-Host
        
        Write-Host ""
        Write-Host "Bastion instance starting successfully!"
        Write-Host "Instance ID: $bastionInstanceId"
        Write-Host ""
        Write-Host "To connect to the bastion for database access:"
        Write-Host "1. Wait for instance to reach 'running' state (check AWS console)"
        Write-Host "2. Use AWS Systems Manager Session Manager to connect"
        Write-Host "3. Or use SSH if you have the key pair configured"
    } else {
        Write-Warning "Bastion instance is in '$bastionState' state. Cannot start."
        Write-Host "Wait for the instance to reach 'stopped' state before trying to start it."
    }
} else {
    Write-Warning "No Bastion instance found with Name tag '$bastionNameTag'"
    Write-Host ""
    Write-Host "The bastion instance needs to be created first via Terraform."
    Write-Host ""
    Write-Host "To create the bastion temporarily (without modifying terraform.tfvars):"
    Write-Host '  cd infrastructure/envs/dev'
    Write-Host '  terraform apply -var="create_bastion=true"'
    Write-Host "This creates the bastion instance, the relevant security groups, any necessary IAM roles, and updates any other security groups that depend on the bastion one (e.g. the backend and db security groups)."
    Write-Host ""
    Write-Host "NOTE: To fully destroy the bastion when done (to save long-term costs - this is probably not needed on scales of less than a year):"
    Write-Host '  terraform destroy -var="create_bastion=true" -target="module.bastion"'
    Write-Host ""
    Write-Host "Other possible issues:"
    Write-Host "- Instance doesn't have the expected Name tag: '$bastionNameTag'"
    Write-Host "- AWS CLI profile or region configuration issue"
    exit 1
}
