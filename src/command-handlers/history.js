const { getMigrationsRunHistory } = require('../services/dynamodb/migrations-executions-manager')
const { getDynamoDBClient } = require('../clients');

const getHistory = async ({ table, format }) => {

  const ddb = getDynamoDBClient();

  const history = await getMigrationsRunHistory(ddb, table)

  console.info(`History for table ${table}`)
  const sortedHistory = Object.keys(history)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(key => ({
      Date: key,
      Command: history[key].executedCommand,
      'Migration Number': history[key].migrationNumber,
    }))
    
  console.table(sortedHistory)
}

module.exports = getHistory