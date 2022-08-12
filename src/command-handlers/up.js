const path = require('path');
const fs = require('fs').promises;
const { getlatestDataTransformationNumber, hasTransformationRun, syncTransformationRecord } = require('../services/dynamodb/transformations-executions-manager');
const { getDynamoDBClient } = require('../clients');
const { getDataFromS3Bucket } = require('../services/s3');
const { BASE_TRANSFORMATIONS_FOLDER_PATH, TRANSFORMATION_SCRIPT_EXTENSION } = require('../config/constants');
const { ddbErrorsWrapper } = require('../services/dynamodb');
const { parseTransformationFileNumber, getTableDataTransformationFiles } = require('../data-transformation-script-explorer');

const executeDataTransformation = async (ddb, transformation, table, isDryRun) => {
  const { transformationNumber, transformUp, prepare } = transformation;
  const isTransformationRun = await hasTransformationRun(ddb, transformationNumber, table);

  if (!isTransformationRun) {
    let preparationData = {};
    const shouldUsePreparationData = Boolean(prepare);
    if (shouldUsePreparationData) {
      const preparationFilePath = `${table}/v${transformationNumber}`;
      preparationData = await getDataFromS3Bucket(preparationFilePath);
      console.info('Running data transformation script using preparation data');
    }

    const transformationResponse = await transformUp({ ddb, preparationData, isDryRun });
    if (!isDryRun) {
      await syncTransformationRecord(ddb, transformationNumber, table, transformationResponse?.transformed);
    } else {
      console.info("It's a dry run");
    }
  } else {
    console.info(`Data Transformation script ${transformationNumber} has already been executed for table ${table}`);
  }
};

const isGreaterThanLatestTransformationNumber = (fileName, latestDataTransformationNumber) => {
  const transformationFileNumber = parseTransformationFileNumber(fileName);
  return transformationFileNumber > latestDataTransformationNumber;
};

const getScriptsToExecuteForTable = async (table, latestDataTransformationNumber) => {
  try {
    const transformationFiles = await getTableDataTransformationFiles(table);

    const currentTransformationFiles = transformationFiles.filter((fileName) => {
      const isJsFile = path.extname(fileName) === TRANSFORMATION_SCRIPT_EXTENSION;
      return isJsFile && isGreaterThanLatestTransformationNumber(fileName, latestDataTransformationNumber);
    });

    const sortedTransformationFiles = currentTransformationFiles.sort((a, b) => {
      const aNumber = parseTransformationFileNumber(a);
      const bNumber = parseTransformationFileNumber(b);
      return aNumber - bNumber;
    });

    const scriptsToExecute = sortedTransformationFiles
      .map((fileName) => require(
        path.join(BASE_TRANSFORMATIONS_FOLDER_PATH, table, fileName),
      ));

    console.info(`Number of data transformation scripts to execute - ${scriptsToExecute.length} for table ${table}.`);
    return scriptsToExecute;
  } catch (error) {
    console.error(`Could not get data transformations scripts for current table - ${table}, latest data transformation number: ${latestDataTransformationNumber}`);
    throw error;
  }
};

const up = async ({ dry: isDryRun }) => {
  const ddb = getDynamoDBClient();

  const tables = await fs.readdir(BASE_TRANSFORMATIONS_FOLDER_PATH);
  console.info(`Available tables for transformation: ${tables || 'No tables found'}.`);

  return Promise.all(tables.map(async (table) => {
    const latestDataTransformationNumber = await getlatestDataTransformationNumber(ddb, table);
    const transformationsToExecute = await getScriptsToExecuteForTable(
      table,
      latestDataTransformationNumber,
    );

    for (const transformation of transformationsToExecute) {
      console.info('Started data transformation ', transformation.transformationNumber, table);
      await executeDataTransformation(ddb, transformation, table, isDryRun);
    }
  }));
};

module.exports = ddbErrorsWrapper(up);
