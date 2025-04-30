# Terraform main configuration
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "choregarden" {
  bucket = "choregarden-bucket"
  acl    = "private"
}