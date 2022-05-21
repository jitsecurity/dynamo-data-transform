const path = require('path');
const { uploadDataToPrivateS3Bucket } = require('../services/s3');
const { getDynamoDBClient } = require('../clients');

const prepareHandler = async (options) => {
  const {
    table, mVersion, dry: isDryRun,
  } = options;

  const preparationPath = path.join(process.cwd(), 'migrations', table, `${mVersion}.js`);
  const { prepare } = require(preparationPath);

  const ddb = getDynamoDBClient();
  const prepatationDataPath = `${table}/${mVersion}`;
  const preparationData = await prepare(ddb);
  if (isDryRun) {
    console.info(preparationData, 'preparationData');
    console.info("It's a dry run");
  } else {
    await uploadDataToPrivateS3Bucket(
      prepatationDataPath,
      JSON.stringify(preparationData),
    );
  }
};

module.exports = prepareHandler;
