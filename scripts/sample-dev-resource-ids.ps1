# Example config for dev resource IDs (copy to dev-resource-ids.ps1 and edit for your environment)
# Set as environment variables for use in scripts
$env:CHOREGARDEN_REGION = "us-east-1"
$env:CHOREGARDEN_PROFILE = "choregarden-dev"
$env:CHOREGARDEN_VPC_ENDPOINT_TAGS = "choregarden-ecr-api-endpoint,choregarden-ecr-dkr-endpoint,choregarden-secretsmanager-endpoint,choregarden-logs-endpoint"
$env:CHOREGARDEN_RDS_INSTANCE_ID = "choregarden-db-dev"
$env:CHOREGARDEN_ECS_CLUSTER = "choregarden-backend-dev-cluster"
$env:CHOREGARDEN_ECS_SERVICE = "choregarden-backend-dev-service"
$env:CHOREGARDEN_BASTION_NAME_TAG = "bastion"
$env:AWS_PROFILE = "choregarden-dev" # needed for Terraform to use the correct profile
