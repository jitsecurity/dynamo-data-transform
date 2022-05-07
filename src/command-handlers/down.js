const { getDynamoDBClient } = require('../clients');
const { getLatestBatch, removeSequenceFromBatch } = require('../services/dynamodb'); // rename folder

const down = async ({ table, dry: isDryRun }) => {
  const ddb = getDynamoDBClient();

  const latestBatch = await getLatestBatch(ddb, table);
  if (!latestBatch) {
    console.info("No migration has been executed, there is no need to rollback.")
    return;
  }

  const lastSequence = latestBatch.sequences.sort().reverse()[0];
  const { transformDown } = require(`${process.cwd()}/migrations/${table}/v${lastSequence}.js`);
  await transformDown(ddb, isDryRun);

  if (!isDryRun) {
    await removeSequenceFromBatch(ddb, latestBatch.batchNumber, lastSequence, table);
  } else {
    console.info(`It's a dry run`, isDryRun);
  };
};

module.exports = down;