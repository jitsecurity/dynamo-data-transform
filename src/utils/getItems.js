const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

const getItems = async (ddb, lastEvalKey, tableName) => {
  const params = {
    TableName: tableName,
    ExclusiveStartKey: lastEvalKey,
    Limit: 25,
  };

  const scanCommand = new ScanCommand(params);
  return ddb.send(scanCommand);
};

module.exports = getItems;
