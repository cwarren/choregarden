output "endpoint" {
  value = aws_db_instance.this.endpoint
}

output "port" {
  value = aws_db_instance.this.port
}

output "security_group_id" {
  value = aws_security_group.this.id
}
