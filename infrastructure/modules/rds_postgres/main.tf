resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name    = "${var.name}-subnet-group"
    project = "choregarden"
    env     = var.environment
  }
}

resource "aws_security_group" "this" {
  name        = "${var.name}-sg"
  description = "Allow ECS to connect to RDS"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    description = "Allow ECS tasks to connect"
    security_groups = [var.ecs_security_group_id]
  }

  # Allow Bastion host to connect if bastion_security_group_id is set
  dynamic "ingress" {
    for_each = var.bastion_security_group_id != null ? [var.bastion_security_group_id] : []
    content {
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      description     = "Allow Bastion host to connect"
      security_groups = [ingress.value]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name    = "${var.name}-sg"
    project = "choregarden"
    env     = var.environment
  }
}

resource "aws_db_instance" "this" {
  identifier              = var.name
  engine                  = "postgres"
  instance_class          = var.db_instance_class
  allocated_storage       = var.allocated_storage
  db_name                 = var.db_name

  # Credentials intentionally omitted (you'll set via Console or secret)
  username                = "pgadmin"
  password                = "temppassword123"  # This will be immediately replaced manually
  skip_final_snapshot     = true
  publicly_accessible     = false
  vpc_security_group_ids  = [aws_security_group.this.id]
  db_subnet_group_name    = aws_db_subnet_group.this.name
  storage_encrypted        = true

  backup_retention_period = 1

  tags = {
    Name    = var.name
    project = "choregarden"
    env     = var.environment
  }
}
