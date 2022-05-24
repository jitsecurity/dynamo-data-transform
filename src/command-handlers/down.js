const path = require('path');
const { getDynamoDBClient } = require('../clients');
const { DATA_MIGRATIONS_FOLDER_NAME } = require('../config/constants');
const { getLatestDataMigrationNumber, rollbackMigration } = require('../services/dynamodb'); // rename folder
const { ddbErrorsWrapper } = require('../services/dynamodb');
const { getDataFromS3Bucket } = require('../services/s3');

const down = async ({ table, dry: isDryRun }) => {
  const ddb = getDynamoDBClient();

  const latestDataMigrationNumber = await getLatestDataMigrationNumber(ddb, table);
  if (!latestDataMigrationNumber) {
    console.info('No migration has been executed, there is no need to rollback.');
    return;
  }

  const dataMigrationFilePath = path.join(process.cwd(), DATA_MIGRATIONS_FOLDER_NAME, table, `v${latestDataMigrationNumber}.js`);
  const { transformDown, prepare } = require(dataMigrationFilePath);

  let preparationData = {};
  const shouldUsePreparationData = Boolean(prepare);
  if (shouldUsePreparationData) {
    const preparationFilePath = `${table}/v${latestDataMigrationNumber}`;
    preparationData = await getDataFromS3Bucket(preparationFilePath);
    console.info('Running data migration script using preparation data');
  }

  await transformDown(ddb, preparationData, isDryRun);

  if (!isDryRun) {
    await rollbackMigration(ddb, latestDataMigrationNumber, table);
  } else {
    console.info("It's a dry run");
  }
};

module.exports = ddbErrorsWrapper(down);
