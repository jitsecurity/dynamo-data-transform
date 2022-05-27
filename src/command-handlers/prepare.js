const path = require('path');
const { uploadDataToS3Bucket } = require('../services/s3');
const { getDynamoDBClient } = require('../clients');
const { DATA_MIGRATIONS_FOLDER_NAME } = require('../config/constants');
const { ddbErrorsWrapper } = require('../services/dynamodb');

const prepareHandler = async (options) => {
  const {
    table, mVersion, dry: isDryRun,
  } = options;

  const preparationPath = path.join(process.cwd(), DATA_MIGRATIONS_FOLDER_NAME, table, `${mVersion}.js`);
  const { prepare } = require(preparationPath);

  const ddb = getDynamoDBClient();
  const prepatationDataPath = `${table}/${mVersion}`;
  const preparationData = await prepare(ddb);
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
