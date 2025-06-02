output "private_route_table_ids" {
  description = "List of private route table IDs"
  value       = module.vpc.private_route_table_ids
}