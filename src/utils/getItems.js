const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { DATA_MIGRATIONS_KEY_ID } = require('../config/constants');

const filterMigrationRecord = (items) => {
  return items.filter((item) => !Object.values(item).includes(DATA_MIGRATIONS_KEY_ID));
};

const getItems = async (ddb, lastEvalKey, tableName) => {
  const params = {
    TableName: tableName,
    ExclusiveStartKey: lastEvalKey,
    Limit: 25,
  };

  const scanCommand = new ScanCommand(params);
  const scanResponse = await ddb.send(scanCommand);
  scanResponse.Items = filterMigrationRecord(scanResponse.Items);

  return scanResponse;
};

module.exports = getItems;
