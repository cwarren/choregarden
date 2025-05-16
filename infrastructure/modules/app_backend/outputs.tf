output "execution_role_arn" {
  value = aws_iam_role.ecs_task_execution.arn
}

output "security_group_id" {
  description = "The ECS backend security group ID"
  value       = aws_security_group.backend_sg.id
}
