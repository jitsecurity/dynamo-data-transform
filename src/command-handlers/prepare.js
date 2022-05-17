const fs = require('fs').promises;
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { KMSClient } = require('@aws-sdk/client-kms');
const { getEncryptedData } = require('../services/aws-kms');

const savePreparationDataInJson = async (data, path) => {
  await fs.writeFile(path, data);
  console.info(`Saved prepatation data in ${path}`);
};

const prepareHandler = async (options) => {
  const {
    preparationPath, stage, mVersion, dry: isDryRun,
  } = options;
  const { prepare } = require(preparationPath);

  const client = new DynamoDBClient();
  const ddb = DynamoDBDocumentClient.from(client);
  const kms = new KMSClient();
  const env = process.env.ENV_NAME || stage;

  const pathItems = preparationPath.split('/');
  pathItems.pop();
  const prepatationDataPath = `${pathItems.join('/')}/${mVersion}.${env}.encrypted`;
  const preparationData = await prepare(ddb);
  if (isDryRun) {
    console.info(preparationData, 'preparationData');
    console.info("It's a dry run");
  } else {
    const encryptedData = await getEncryptedData(kms, preparationData);
    await savePreparationDataInJson(encryptedData, prepatationDataPath);
  }
};

module.exports = prepareHandler;
