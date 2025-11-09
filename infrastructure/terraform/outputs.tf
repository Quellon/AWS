output "ingest_function_url" {
  description = "URL for the Ingest Lambda function"
  value       = aws_lambda_function_url.ingest.function_url
}

output "read_recent_function_url" {
  description = "URL for the ReadRecent Lambda function"
  value       = aws_lambda_function_url.read_recent.function_url
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.logs.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.logs.arn
}

output "ingest_lambda_name" {
  description = "Name of the Ingest Lambda function"
  value       = aws_lambda_function.ingest.function_name
}

output "read_recent_lambda_name" {
  description = "Name of the ReadRecent Lambda function"
  value       = aws_lambda_function.read_recent.function_name
}
