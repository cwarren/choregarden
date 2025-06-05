# Stop Dev Resources Script
# This script stops all billable dev resources: VPC interface endpoints, RDS, ECS backend, and Bastion EC2 instance.
# Resource config is loaded from dev-resource-ids.ps1 (which should be in .gitignore)

# TO RUN:
# 1. navigate to the scripts directory
# 2. run: .\stop-dev-resources.ps1

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
$endpointTags = $env:CHOREGARDEN_VPC_ENDPOINT_TAGS -split ','
$rdsInstanceId = $env:CHOREGARDEN_RDS_INSTANCE_ID
$ecsCluster = $env:CHOREGARDEN_ECS_CLUSTER
$ecsService = $env:CHOREGARDEN_ECS_SERVICE

# Auto-discover Bastion instance ID by Name tag
$bastionNameTag = $env:CHOREGARDEN_BASTION_NAME_TAG
$bastionInstanceId = aws ec2 describe-instances --region $region --profile $profile --filters "Name=tag:Name,Values=$bastionNameTag" "Name=instance-state-name,Values=running,stopped" | ConvertFrom-Json | Select-Object -ExpandProperty Reservations | ForEach-Object { $_.Instances } | Where-Object { $_ } | Select-Object -First 1 -ExpandProperty InstanceId

Write-Host "Region: $region"
Write-Host "Profile: $profile"
Write-Host "VPC Endpoint Tags: $($endpointTags -join ', ')"
Write-Host "RDS Instance ID: $rdsInstanceId"
Write-Host "ECS Cluster: $ecsCluster"
Write-Host "ECS Service: $ecsService"
Write-Host "Bastion Name Tag: $bastionNameTag"
Write-Host "Bastion Instance ID: $bastionInstanceId"

# Dynamically look up VPC endpoint IDs by Name tag
$vpcEndpointIds = @()
foreach ($tag in $endpointTags) {
    $id = aws ec2 describe-vpc-endpoints --region $region --profile $profile --filters Name=tag:Name,Values=$tag | ConvertFrom-Json | Select-Object -ExpandProperty VpcEndpoints | Select-Object -ExpandProperty VpcEndpointId
    if ($id) { $vpcEndpointIds += $id }
}

Write-Host "Resolved VPC Endpoint IDs: $($vpcEndpointIds -join ', ')"

# 1. Delete interface VPC endpoints
foreach ($id in $vpcEndpointIds) {
    aws ec2 delete-vpc-endpoints --vpc-endpoint-ids $id --region $region --profile $profile | Out-Host
}

# 2. Stop RDS instance
aws rds stop-db-instance --db-instance-identifier $rdsInstanceId --region $region --profile $profile | Out-Host

# 3. Scale down ECS service
aws ecs update-service --cluster $ecsCluster --service $ecsService --desired-count 0 --region $region --profile $profile | Out-Host

# 4. Stop Bastion EC2 instance
if ($bastionInstanceId) {
    aws ec2 stop-instances --instance-ids $bastionInstanceId --region $region --profile $profile | Out-Host
} else {
    Write-Warning "No Bastion instance found with Name tag '$bastionNameTag'"
}
