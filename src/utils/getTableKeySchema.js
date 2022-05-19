const { DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { getDynamoDBClient } = require('../clients');

const getTableKeySchema = async (table) => {
  try {
    const ddbClient = getDynamoDBClient();
    const { Table } = await ddbClient.send(new DescribeTableCommand({ TableName: table }));
    return Table.KeySchema;
  } catch (error) {
    console.error(`Could not get key schema of table ${table}`, error);
    throw error;
  }
};

module.exports = getTableKeySchema;
