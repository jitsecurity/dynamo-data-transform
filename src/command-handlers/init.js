const fs = require('fs');
const path = require('path');
const { DATA_TRANSFORMATIONS_FOLDER_NAME } = require('../config/constants');

const createFolderIfNotExist = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    console.info(`${folderPath} folder does not exist, creating...`);
    fs.mkdirSync(folderPath);
    return false;
  }
  console.info(`${folderPath} already exists`);
  return true;
};

const initHandler = async ({ tableNames }) => {
  const baseTransformationsFolderPath = path.join(process.cwd(), DATA_TRANSFORMATIONS_FOLDER_NAME);

  createFolderIfNotExist(baseTransformationsFolderPath);

  tableNames?.forEach((tableName) => {
    const isExist = createFolderIfNotExist(`${baseTransformationsFolderPath}/${tableName}`);
    if (!isExist) {
      const origin = path.join(__dirname, '../config/transformation-template-file.js');
      const destination = path.join(baseTransformationsFolderPath, tableName, 'v1_script-name.js');
      const originFile = fs.readFileSync(origin, 'utf8');
      const destinationFile = originFile.replace(/{{YOUR_TABLE_NAME}}/g, tableName);

      fs.writeFileSync(destination, destinationFile);
      console.info(`Transformation template v1.js file has created for ${tableName}`);
    }
  });
};

module.exports = initHandler;
