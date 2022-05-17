const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const getDynamoDBClient = () => {
  let ddbClient;
  if (process.env.AWS_CUSTOM_ENDPOINT) {
    ddbClient = new DynamoDBClient({
      endpoint: process.env.AWS_CUSTOM_ENDPOINT,
    });
  } else {
    ddbClient = new DynamoDBClient();
  }
  return DynamoDBDocumentClient.from(ddbClient);
};

module.exports = {
  getDynamoDBClient,
};
