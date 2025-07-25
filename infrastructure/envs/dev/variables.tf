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

variable "create_bastion" {
  description = "Whether to create a Bastion host"
  type        = bool
  default     = false
}

variable "bastion_ami_id" {
  description = "AMI ID for Bastion EC2 instance"
  type        = string
  default     = "ami-0c02fb55956c7d316"  # Amazon Linux 2 in us-east-1
}

variable "bastion_instance_type" {
  description = "EC2 instance type for Bastion host"
  type        = string
  default     = "t3.micro"
}

variable "bastion_key_name" {
  description = "SSH key name for Bastion EC2 instance"
  type        = string
  default     = "choregarden-bastion-dev"
}

variable "bastion_allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH to Bastion (your IP) - only needed if create_bastion=true"
  type        = string
  default     = "127.0.0.1/32"  # Localhost only as safe default
}
