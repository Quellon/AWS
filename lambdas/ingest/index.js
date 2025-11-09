const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler for ingesting log entries
 *
 * Expected input format:
 * {
 *   "severity": "info" | "warning" | "error",
 *   "message": "Log message text"
 * }
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Validate input
    if (!body.severity || !body.message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Missing required fields: severity and message are required'
        })
      };
    }

    // Validate severity
    const validSeverities = ['info', 'warning', 'error'];
    if (!validSeverities.includes(body.severity)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
        })
      };
    }

    // Create log entry
    const logEntry = {
      logPartition: 'LOGS', // Single partition key for all logs
      dateTime: new Date().toISOString(),
      id: uuidv4(),
      severity: body.severity,
      message: body.message
    };

    // Store in DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: logEntry
    }));

    console.log('Successfully stored log entry:', logEntry.id);

    // Return success response
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        id: logEntry.id,
        dateTime: logEntry.dateTime
      })
    };

  } catch (error) {
    console.error('Error processing log entry:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
