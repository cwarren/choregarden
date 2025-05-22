output "public_ip" {
  description = "Public IP of the Bastion host"
  value       = aws_instance.bastion.public_ip
}

output "security_group_id" {
  description = "Security group ID of the Bastion host"
  value       = aws_security_group.bastion.id
}
