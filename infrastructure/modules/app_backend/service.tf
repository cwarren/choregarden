resource "aws_security_group" "backend_sg" {
  name        = "${var.name}-sg"
  description = "Allow inbound HTTP for backend"
  vpc_id      = var.vpc_id

  # Only allow traffic from within the VPC (e.g., API Gateway, NLB, or Bastion for testing)
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_service" "this" {
  name            = "${var.name}-service"
  cluster         = aws_ecs_cluster.this.id
  launch_type     = "FARGATE"
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = 1

  network_configuration {
    subnets         = var.private_subnets
    security_groups = [aws_security_group.backend_sg.id]
    # assign_public_ip is omitted for private subnet
  }

  depends_on = [aws_iam_role_policy_attachment.attach_policy]
}
