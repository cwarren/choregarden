output "execution_role_arn" {
  value = aws_iam_role.ecs_task_execution.arn
}

output "security_group_id" {
  description = "The ECS backend security group ID"
  value       = aws_security_group.backend_sg.id
}

output "nlb_arn" {
  description = "The ARN of the backend NLB for API Gateway integration"
  value       = aws_lb.backend_nlb.arn
}

output "nlb_dns_name" {
  description = "The DNS name of the backend NLB for API Gateway integration"
  value       = aws_lb.backend_nlb.dns_name
}

output "nlb_listener_arn" {
  description = "The ARN of the backend NLB listener for API Gateway integration"
  value       = aws_lb_listener.backend.arn
}
