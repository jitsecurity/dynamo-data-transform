const fs = require('fs').promises
const { getEncryptedData } = require('../services/aws-kms')

const prepareHandler = async (provider, options) => {
  const { preparationPath, stage, mVersion, dry: isDryRun } = options
  const { prepare } = require(preparationPath)

  const ddb = new provider.sdk.DynamoDB.DocumentClient()
  const kms = new provider.sdk.KMS()
  const env = process.env.ENV_NAME || stage

  const pathItems = preparationPath.split('/')
  pathItems.pop()
  const prepatationDataPath = pathItems.join('/') + `/${mVersion}.${env}.encrypted`
  const preparationData = await prepare(ddb)
  if (isDryRun) {
    console.info(preparationData, 'preparationData')
    console.info(`It's a dry run`, isDryRun)
  } else {
    const encryptedData = await getEncryptedData(kms, preparationData)
    await savePreparationDataInJson(encryptedData, prepatationDataPath)
  }
}

const savePreparationDataInJson = async (data, path) => {
  await fs.writeFile(path, data)
  console.info(`Saved prepatation data in ${path}`)
}

module.exports = prepareHandler
