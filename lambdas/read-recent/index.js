const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler for reading the 100 most recent log entries
 *
 * Returns logs sorted by dateTime (newest first)
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    // Query DynamoDB for the most recent 100 logs
    const response = await docClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'logPartition = :partition',
      ExpressionAttributeValues: {
        ':partition': 'LOGS'
      },
      ScanIndexForward: false, // Sort descending (newest first)
      Limit: 100
    }));

    console.log(`Retrieved ${response.Items.length} log entries`);

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        count: response.Items.length,
        logs: response.Items
      })
    };

  } catch (error) {
    console.error('Error retrieving log entries:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
