# DynamoDB Table for Log Entries
resource "aws_dynamodb_table" "logs" {
  name           = "${var.project_name}-${var.environment}-logs"
  billing_mode   = "PAY_PER_REQUEST" # On-demand pricing
  hash_key       = "logPartition"
  range_key      = "dateTime"

  attribute {
    name = "logPartition"
    type = "S"
  }

  attribute {
    name = "dateTime"
    type = "S"
  }

  # Enable point-in-time recovery for data protection
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-logs"
  }
}
