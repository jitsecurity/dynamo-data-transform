const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { DATA_TRANSFORMATIONS_KEY_ID } = require('../config/constants');

const filterTransformationRecord = (items) => {
  return items.filter((item) => !Object.values(item).includes(DATA_TRANSFORMATIONS_KEY_ID));
};

const getItems = async (ddb, lastEvalKey, tableName) => {
  const params = {
    TableName: tableName,
    ExclusiveStartKey: lastEvalKey,
    Limit: 25,
  };

  const scanCommand = new ScanCommand(params);
  const scanResponse = await ddb.send(scanCommand);
  scanResponse.Items = filterTransformationRecord(scanResponse.Items);

  return scanResponse;
};

module.exports = getItems;
