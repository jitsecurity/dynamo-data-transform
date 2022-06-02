const { getTransformationsRunHistory } = require('../services/dynamodb/transformations-executions-manager');
const { getDynamoDBClient } = require('../clients');
const { ddbErrorsWrapper } = require('../services/dynamodb');

const getHistory = async ({ table }) => {
  const ddb = getDynamoDBClient();

  const history = await getTransformationsRunHistory(ddb, table);

  console.info(`History for table ${table}`);
  const sortedHistory = Object.keys(history)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((key) => ({
      Date: new Date(key).toLocaleString(),
      Command: history[key].executedCommand,
      'Transformation Number': history[key].transformationNumber,
    }));

  console.table(sortedHistory);
};

module.exports = ddbErrorsWrapper(getHistory);
