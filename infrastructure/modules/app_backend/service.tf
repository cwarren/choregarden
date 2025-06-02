resource "aws_security_group" "backend_sg" {
  name        = "${var.name}-sg"
  description = "Allow inbound HTTP for backend"
  vpc_id      = var.vpc_id

  # Remove all inline ingress rules to avoid Terraform loop
  # Only egress rule remains inline
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "allow_backend_http" {
  type              = "ingress"
  from_port         = 5000
  to_port           = 5000
  protocol          = "tcp"
  security_group_id = aws_security_group.backend_sg.id
  cidr_blocks       = ["10.0.0.0/16"]
  description       = "Allow HTTP from VPC CIDR"
}

resource "aws_security_group_rule" "allow_bastion_https" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.backend_sg.id
  source_security_group_id = var.bastion_security_group_id
  description              = "Allow HTTPS from Bastion for VPC endpoint access"
}

resource "aws_security_group_rule" "allow_https_from_backend" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.backend_sg.id
  source_security_group_id = aws_security_group.backend_sg.id
  description              = "Allow ECS tasks to access VPC endpoint for Secrets Manager"
}

resource "aws_service_discovery_service" "backend" {
  count = var.enable_service_discovery ? 1 : 0
  name = "${var.name}"
  dns_config {
    namespace_id = var.cloudmap_namespace_id
    dns_records {
      type = "A"
      ttl  = 10
    }
    routing_policy = "MULTIVALUE"
  }
  health_check_custom_config {
    failure_threshold = 1
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
  }
  dynamic "service_registries" {
    for_each = var.enable_service_discovery ? [1] : []
    content {
      registry_arn = aws_service_discovery_service.backend[0].arn
    }
  }

  depends_on = [aws_iam_role_policy_attachment.attach_policy]
}
