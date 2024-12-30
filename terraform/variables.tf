variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  default     = "microservices-demo"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}

variable "key_pair_name" {
  description = "Key Pair"
  default        = "key"
}

variable "database_name" {
  description = "Name of the database"
  default     = "microservices"
}

variable "database_username" {
  description = "Database master username"
  default     = "root"
}

variable "database_password" {
  description = "Database master password"
  sensitive   = true
}

variable "db_username" {
  description = "Username for PostgreSQL RDS instance"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Password for PostgreSQL RDS instance"
  type        = string
  sensitive   = true
}
