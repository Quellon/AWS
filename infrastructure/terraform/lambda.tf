# Package Ingest Lambda
data "archive_file" "ingest_lambda_package" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambdas/ingest"
  output_path = "${path.module}/../../lambdas/ingest.zip"
  excludes    = ["node_modules", "package-lock.json"]
}

# Package ReadRecent Lambda
data "archive_file" "read_recent_lambda_package" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambdas/read-recent"
  output_path = "${path.module}/../../lambdas/read-recent.zip"
  excludes    = ["node_modules", "package-lock.json"]
}

# Ingest Lambda Function
resource "aws_lambda_function" "ingest" {
  filename         = data.archive_file.ingest_lambda_package.output_path
  function_name    = "${var.project_name}-${var.environment}-ingest"
  role            = aws_iam_role.ingest_lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.ingest_lambda_package.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.logs.name
    }
  }

  depends_on = [aws_iam_role_policy.ingest_lambda_policy]
}

# ReadRecent Lambda Function
resource "aws_lambda_function" "read_recent" {
  filename         = data.archive_file.read_recent_lambda_package.output_path
  function_name    = "${var.project_name}-${var.environment}-read-recent"
  role            = aws_iam_role.read_recent_lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.read_recent_lambda_package.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.logs.name
    }
  }

  depends_on = [aws_iam_role_policy.read_recent_lambda_policy]
}

# Lambda Function URL for Ingest
resource "aws_lambda_function_url" "ingest" {
  function_name      = aws_lambda_function.ingest.function_name
  authorization_type = "NONE" # Public access - for demo purposes

  cors {
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["content-type"]
    expose_headers    = ["keep-alive", "date"]
    max_age          = 86400
  }
}

# Lambda Function URL for ReadRecent
resource "aws_lambda_function_url" "read_recent" {
  function_name      = aws_lambda_function.read_recent.function_name
  authorization_type = "NONE" # Public access - for demo purposes

  cors {
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["content-type"]
    expose_headers    = ["keep-alive", "date"]
    max_age          = 86400
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "ingest_lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.ingest.function_name}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "read_recent_lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.read_recent.function_name}"
  retention_in_days = 7
}
