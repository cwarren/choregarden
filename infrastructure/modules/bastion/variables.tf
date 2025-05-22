variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_id" {
  description = "Public subnet ID for Bastion host"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for Bastion EC2 instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "SSH key name for EC2 instance"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH to Bastion (your IP)"
  type        = string
}
