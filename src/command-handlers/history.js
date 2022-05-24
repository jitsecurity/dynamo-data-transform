const { getMigrationsRunHistory } = require('../services/dynamodb/migrations-executions-manager');
const { getDynamoDBClient } = require('../clients');
const { ddbErrorsWrapper } = require('../services/dynamodb');

const getHistory = async ({ table }) => {
  const ddb = getDynamoDBClient();

  const history = await getMigrationsRunHistory(ddb, table);

  console.info(`History for table ${table}`);
  const sortedHistory = Object.keys(history)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((key) => ({
      Date: new Date(key).toLocaleString(),
      Command: history[key].executedCommand,
      'Migration Number': history[key].migrationNumber,
    }));

  console.table(sortedHistory);
};

module.exports = ddbErrorsWrapper(getHistory);
