resource "aws_db_subnet_group" "postgres" {
  name       = "postgres-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "PostgreSQL DB subnet group"
  }
}

resource "aws_security_group" "rds" {
  name        = "postgres-rds-sg"
  description = "Security group for PostgreSQL RDS"
  vpc_id      = aws_vpc.my_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "postgres-rds-sg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "microservices-postgres"
  engine              = "postgres"
  engine_version      = "14.7"
  instance_class      = "db.t3.medium"
  allocated_storage   = 20
  storage_type        = "gp2"
  storage_encrypted   = true
  
  db_name             = "microservices"
  username           = var.db_username
  password           = var.db_password

  multi_az               = false
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  skip_final_snapshot    = true
  
  tags = {
    Name        = "microservices-postgres"
    Environment = var.environment
  }
}
