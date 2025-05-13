resource "aws_secretsmanager_secret" "this" {
  name = var.name
  description = var.description
  recovery_window_in_days = 0  # optional: delete immediately if destroyed

  tags = {
    project = "choregarden"
    env     = var.environment
  }
}
