const { BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const getKeySchemaOfItem = (item, keySchema) => {
  const keySchemaOfItem = Object.keys(item).reduce((acc, key) => {
    if (keySchema.find(({ AttributeName }) => AttributeName === key)) {
      acc[key] = item[key];
    }
    return acc;
  }, {});

  return keySchemaOfItem;
};

const batchDeleteItems = async (ddb, tableName, items, keySchema) => {
  const params = {
    RequestItems: {
      [tableName]: items.map((item) => ({
        DeleteRequest: {
          Key: getKeySchemaOfItem(item, keySchema),
        },
      })),
    },
    ReturnConsumedCapacity: 'TOTAL',
    ReturnItemCollectionMetrics: 'SIZE',
  };
  const batchWriteCommand = new BatchWriteCommand(params);
  return ddb.send(batchWriteCommand);
};

module.exports = batchDeleteItems;
