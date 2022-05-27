const fs = require('fs');
const { DATA_MIGRATIONS_FOLDER_NAME } = require('../config/constants');

const createFolderIfNotExist = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    console.info(`${folderPath} folder does not exist, creating it`);
    fs.mkdirSync(folderPath);
    return false;
  }
  console.info(`${folderPath} already exists`);
  return true;
};

const initHandler = async ({ tableNames }) => {
  const baseMigrationsFolderPath = `${process.cwd()}/${DATA_MIGRATIONS_FOLDER_NAME}`;

  createFolderIfNotExist(baseMigrationsFolderPath);

  tableNames?.forEach((tableName) => {
    const isExist = createFolderIfNotExist(`${baseMigrationsFolderPath}/${tableName}`);
    if (!isExist) {
      const origin = `${__dirname}/../config/migration-template-file.js`;
      const destination = `${baseMigrationsFolderPath}/${tableName}/v1_script-name.js`;
      const originFile = fs.readFileSync(origin, 'utf8');
      const destinationFile = originFile.replace(/{{YOUR_TABLE_NAME}}/g, tableName);
      fs.writeFile(destination, destinationFile, 'utf8', (error) => {
        if (error) {
          console.error(`Could not write migration template file for table ${tableName}`, error);
          throw error;
        }
        console.info(`Migration template v1.js file has created for ${tableName}`);
      });
    }
  });
};

module.exports = initHandler;
