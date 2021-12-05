const fs = require('fs')

const MIGRATIONS_FOLDER_NAME = 'migrations'

const initHandler = async (provider, options) => {
  const baseMigrationsFolderPath = `${process.cwd()}/${MIGRATIONS_FOLDER_NAME}`
  console.log(Object.keys(provider.serverless.config))
  const resources = provider.serverless.service.resources.Resources

  if (!fs.existsSync(baseMigrationsFolderPath)) {
    fs.mkdirSync(baseMigrationsFolderPath)
    const tableNames = Object.keys(resources).filter((rValue) => {
      return resources[rValue].Type === 'AWS::DynamoDB::Table'
    })

    tableNames.forEach(tableName => {
      fs.mkdirSync(`${baseMigrationsFolderPath}/${tableName}`)
      const origin = `${__dirname}/../config/migration-template-file.js`
      const destination = `${baseMigrationsFolderPath}/${tableName}/v1.js`
      fs.copyFile(origin, destination, (err) => {
        if (err) throw err;
        console.info('v1.js file has created');
      });
    })

  } else {
    console.info(`migrations folder already exists`)
  }

}

module.exports = initHandler