terraform {
  backend "s3" {
    bucket         = "choregarden-dev-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "choregarden-dev-terraform-locks"
    encrypt        = true
  }
}
