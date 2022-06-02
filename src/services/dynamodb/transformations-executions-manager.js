const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { DATA_TRANSFORMATIONS_KEY_ID } = require('../../config/constants');
const getTableKeySchema = require('../../utils/getTableKeySchema');

const getDataTransformationKey = async (table) => {
  const keySchema = await getTableKeySchema(table);
  const dataTransformationKey = keySchema.reduce((acc, val) => ({
    ...acc,
    [val.AttributeName]: DATA_TRANSFORMATIONS_KEY_ID,
  }), {});
  return dataTransformationKey;
};

const getDataTransformationRecord = async (ddb, table) => {
  const dataTransformationKey = await getDataTransformationKey(table);
  const getCommand = new GetCommand({
    TableName: table,
    Key: dataTransformationKey,
  });

  try {
    const { Item } = await ddb.send(getCommand);

    if (!Item) console.info(`No data transformations record for table ${table}`);
    return Item || dataTransformationKey;
  } catch (error) {
    console.error(`Could not get data transformations record for table ${table}`);
    throw error;
  }
};

const hasTransformationRun = async (ddb, transformationNumber, table) => {
  const transformationRecord = await getDataTransformationRecord(ddb, table);

  const hasTransformationExecuted = transformationRecord
    .executionState?.includes(transformationNumber);

  return !!hasTransformationExecuted;
};

const syncTransformationRecord = async (ddb, transformationNumber, table, transformed) => {
  const transformationRecord = await getDataTransformationRecord(ddb, table);
  const executionState = transformationRecord?.executionState || [];
  const transformationsRunHistory = transformationRecord ? transformationRecord.TransformationsRunHistory : {};
  const updatedItem = {
    ...transformationRecord,
    executionState: [...executionState, transformationNumber],
    TransformationsRunHistory: {
      ...transformationsRunHistory,
      [new Date().toISOString()]: {
        transformationNumber,
        executedCommand: 'up',
        transformed,
      },
    },
  };

  const putCommand = new PutCommand({
    TableName: table,
    Item: updatedItem,
  });

  await ddb.send(putCommand);
};

const getTransformationsRunHistory = async (ddb, table) => {
  const transformationRecord = await getDataTransformationRecord(ddb, table);
  return transformationRecord?.TransformationsRunHistory || {};
};

const rollbackTransformation = async (ddb, transformationNumber, table) => {
  const transformationRecord = await getDataTransformationRecord(ddb, table);
  if (!transformationRecord) {
    return;
  }
  const executionState = transformationRecord?.executionState || [];
  const updatedExecutionState = executionState.filter(
    (executedNumber) => executedNumber !== transformationNumber,
  );
  const transformationsRunHistory = transformationRecord ? transformationRecord.TransformationsRunHistory : {};

  const updatedItem = {
    ...transformationRecord,
    executionState: updatedExecutionState,
    TransformationsRunHistory: {
      ...transformationsRunHistory,
      [new Date().toISOString()]: {
        transformationNumber,
        executedCommand: 'down',
      },
    },
  };

  const putCommand = new PutCommand({
    TableName: table,
    Item: updatedItem,
  });

  return ddb.send(putCommand);
};

const getlatestDataTransformationNumber = async (ddb, table) => {
  console.info(`Getting latest data transformation number for table ${table}.`);

  try {
    const transformationRecord = await getDataTransformationRecord(ddb, table);
    const latestDataTransformationNumber = transformationRecord.executionState
      ?.sort((a, b) => b - a)[0];

    if (!latestDataTransformationNumber) {
      console.info('No data transformations have been run');
      return 0;
    }
    return latestDataTransformationNumber;
  } catch (error) {
    console.error(
      `An error has occured while trying to get latest data transformation number for table ${table}`,
    );
    throw error;
  }
};

module.exports = {
  getlatestDataTransformationNumber,
  getDataTransformationRecord,
  rollbackTransformation,
  syncTransformationRecord,
  hasTransformationRun,
  getTransformationsRunHistory,
};
