const { uploadDataToS3Bucket } = require('../services/s3');
const { getDynamoDBClient } = require('../clients');
const { ddbErrorsWrapper } = require('../services/dynamodb');
const { getDataTransformationScriptFullPath } = require('../data-transformation-script-explorer');
const { TRANSFORMATION_NUMBER_PREFIX } = require('../config/constants');

const prepareHandler = async ({ table, tNumber, dry: isDryRun }) => {
  const preparationPath = await getDataTransformationScriptFullPath(
    Number(tNumber),
    table,
  );

  const { prepare } = require(preparationPath);

  const ddb = getDynamoDBClient();
  const prepatationDataPath = `${table}/${TRANSFORMATION_NUMBER_PREFIX}${tNumber}`;
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
