const { uploadDataToS3Bucket } = require('../services/s3');
const { getDynamoDBClient } = require('../clients');
const { ddbErrorsWrapper } = require('../services/dynamodb');
const { getDataMigrationScriptFullPath } = require('../data-migration-script-explorer');
const { MIGRATION_NUMBER_PREFIX } = require('../config/constants');

const prepareHandler = async ({ table, mNumber, dry: isDryRun }) => {
  const preparationPath = await getDataMigrationScriptFullPath(
    mNumber,
    table,
  );

  const { prepare } = require(preparationPath);

  const ddb = getDynamoDBClient();
  const prepatationDataPath = `${table}/${MIGRATION_NUMBER_PREFIX}${mNumber}`;
  const preparationData = await prepare({ ddb, isDryRun });
  if (isDryRun) {
    console.info(preparationData, 'preparationData');
    console.info("It's a dry run");
  } else {
    await uploadDataToS3Bucket(
      prepatationDataPath,
      JSON.stringify(preparationData),
    );
  }
};

module.exports = ddbErrorsWrapper(prepareHandler);
