variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type    = string
  default = "choregarden-dev"
}

variable "create_nat_gateway" {
  description = "Whether to create a NAT Gateway"
  type        = bool
  default     = true
}

variable "bastion_ami_id" {
  description = "AMI ID for Bastion EC2 instance"
  type        = string
}

variable "bastion_instance_type" {
  description = "EC2 instance type for Bastion host"
  type        = string
  default     = "t3.micro"
}

variable "bastion_key_name" {
  description = "SSH key name for Bastion EC2 instance"
  type        = string
}

variable "bastion_allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH to Bastion (your IP)"
  type        = string
}
