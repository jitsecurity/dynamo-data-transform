const fs = require('fs')

const MIGRATIONS_FOLDER_NAME = 'migrations'

const createFolderIfNotExist = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    console.info(`${folderPath} folder does not exist, creating it`)
    fs.mkdirSync(folderPath)
    return false
  } else {
    console.info(`${folderPath} already exists`)
    return true
  }
}

const getTableNames = (resources) => {
  return Object.keys(resources).filter((rValue) => {
    return resources[rValue].Type === 'AWS::DynamoDB::Table'
  })
}

const initHandler = async (provider, options) => {
  const baseMigrationsFolderPath = `${process.cwd()}/${MIGRATIONS_FOLDER_NAME}`
  const resources = provider.serverless.service.resources.Resources

  createFolderIfNotExist(baseMigrationsFolderPath)

  const tableNames = getTableNames(resources)

  tableNames.forEach(tableName => {
    const isExist = createFolderIfNotExist(`${baseMigrationsFolderPath}/${tableName}`)
    if(!isExist) {
        const origin = `${__dirname}/../config/migration-template-file.js`
        const destination = `${baseMigrationsFolderPath}/${tableName}/v1.js`
        const originFile = fs.readFileSync(origin, 'utf8')
        const destinationFile = originFile.replace(/{{YOUR_TABLE_NAME}}/g, tableName)
        fs.writeFile(destination, destinationFile, 'utf8', (error) => {
          if (error) {
            console.error(`Could not write migration template file for table ${tableName}`, error);
            throw error
          }
          console.info(`Migration template v1.js file has created for ${tableName}`);
        })
      }
  })
}

module.exports = initHandler