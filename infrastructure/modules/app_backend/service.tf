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
  count = var.bastion_security_group_id != null ? 1 : 0
  
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

resource "aws_security_group_rule" "allow_vpclink_backend" {
  type                     = "ingress"
  from_port                = 5000
  to_port                  = 5000
  protocol                 = "tcp"
  security_group_id        = aws_security_group.backend_sg.id
  source_security_group_id = aws_security_group.backend_sg.id
  description              = "Allow VPC Link to backend on 5000"
}

resource "aws_lb" "backend_nlb" {
  name               = "${var.name}-nlb"
  internal           = true
  load_balancer_type = "network"
  subnets            = var.private_subnets
  enable_deletion_protection = false

  tags = {
    Name = "${var.name}-nlb"
    env  = "dev"
  }
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.name}-tg"
  port        = 5000
  protocol    = "TCP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    protocol            = "TCP"
    port                = "5000"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 10
  }

  tags = {
    Name = "${var.name}-tg"
    env  = "dev"
  }
}

resource "aws_lb_listener" "backend" {
  load_balancer_arn = aws_lb.backend_nlb.arn
  port              = 5000
  protocol          = "TCP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
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
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 5000
  }

  depends_on = [aws_iam_role_policy_attachment.attach_policy]
}
