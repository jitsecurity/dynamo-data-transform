const { getDynamoDBClient } = require('../clients');
const { getDataTransformationScriptFullPath } = require('../data-transformation-script-explorer');
const { getlatestDataTransformationNumber, rollbackTransformation } = require('../services/dynamodb'); // rename folder
const { ddbErrorsWrapper } = require('../services/dynamodb');
const { getDataFromS3Bucket } = require('../services/s3');

const down = async ({ table, dry: isDryRun }) => {
  const ddb = getDynamoDBClient();

  const latestDataTransformationNumber = await getlatestDataTransformationNumber(ddb, table);
  if (!latestDataTransformationNumber) {
    console.info('No transformation has been executed, there is no need to rollback.');
    return;
  }

  const dataTransformationFilePath = await getDataTransformationScriptFullPath(
    latestDataTransformationNumber,
    table,
  );

  const { transformDown, prepare } = require(dataTransformationFilePath);

  let preparationData = {};
  const shouldUsePreparationData = Boolean(prepare);
  if (shouldUsePreparationData) {
    const preparationFilePath = `${table}/v${latestDataTransformationNumber}`;
    preparationData = await getDataFromS3Bucket(preparationFilePath);
    console.info('Running data transformation script using preparation data');
  }

  await transformDown({ ddb, preparationData, isDryRun });

  if (!isDryRun) {
    await rollbackTransformation(ddb, latestDataTransformationNumber, table);
  } else {
    console.info("It's a dry run");
  }
};

module.exports = ddbErrorsWrapper(down);
