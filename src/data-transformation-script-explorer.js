const path = require('path');
const fs = require('fs').promises;

const {
  BASE_TRANSFORMATIONS_FOLDER_PATH, TRANSFORMATION_SCRIPT_EXTENSION,
  TRANSFORMATION_NAME_SEPARATOR, TRANSFORMATION_NUMBER_PREFIX,
} = require('./config/constants');

const parseTransformationFileNumber = (fileName) => {
  const filetransformationNumber = Number(
    path.basename(fileName, TRANSFORMATION_SCRIPT_EXTENSION)
      .split(TRANSFORMATION_NAME_SEPARATOR)[0]
      .replace(TRANSFORMATION_NUMBER_PREFIX, ''),
  );

  return filetransformationNumber;
};

const getTableDataTransformationFiles = async (table) => {
  const transformationFiles = await fs.readdir(path.join(BASE_TRANSFORMATIONS_FOLDER_PATH, table));
  return transformationFiles;
};

const getDataTransformationScriptFileName = async (transformationNumber, table) => {
  const transformationFiles = await getTableDataTransformationFiles(table);

  const fileName = transformationFiles.find((currFileName) => {
    const currFiletransformationNumber = parseTransformationFileNumber(currFileName);
    return currFiletransformationNumber === transformationNumber;
  });

  if (!fileName) {
    throw new Error(`Could not find data transformation script for transformation number ${transformationNumber}`);
  }

  return fileName;
};

const getDataTransformationScriptFullPath = async (transformationNumber, table) => {
  const fileName = await getDataTransformationScriptFileName(transformationNumber, table);
  return path.join(BASE_TRANSFORMATIONS_FOLDER_PATH, table, fileName);
};

module.exports = {
  parseTransformationFileNumber,
  getDataTransformationScriptFileName,
  getDataTransformationScriptFullPath,
  getTableDataTransformationFiles,
};
