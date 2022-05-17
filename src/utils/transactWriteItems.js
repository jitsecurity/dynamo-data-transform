const { TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

async function transactWriteItems(ddb, tableName, records) {
  try {
    const transactItems = records.map((record) => {
      const { action = 'put', key, ...item } = record;
      switch (action) {
        case 'put':
          return {
            Put: {
              TableName: tableName,
              Item: item,
            },
          };
        case 'delete':
          return {
            Delete: {
              TableName: tableName,
              Key: key,
            },
          };
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    });

    const transactWriteCommand = new TransactWriteCommand({
      TransactItems: transactItems,
      ReturnConsumedCapacity: 'TOTAL',
      ReturnItemCollectionMetrics: 'SIZE',
    });

    return await ddb.send(transactWriteCommand);
  } catch (e) {
    console.error(`Error while writing to table ${tableName}`, e);
    throw e;
  }
}

module.exports = transactWriteItems;
