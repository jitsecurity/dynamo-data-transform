const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const getTableKeySchema = require('../../utils/getTableKeySchema');

const DATA_MIGRATIONS_KEY_ID = 'DataMigrations';

const getDataMigrationKey = async (table) => {
  const keySchema = await getTableKeySchema(table);
  const dataMigrationKey = keySchema.reduce((acc, val) => ({
    ...acc,
    [val.AttributeName]: DATA_MIGRATIONS_KEY_ID,
  }), {});
  return dataMigrationKey;
};

const getDataMigrationRecord = async (ddb, table) => {
  const dataMigrationKey = await getDataMigrationKey(table);
  const getCommand = new GetCommand({
    TableName: table,
    Key: dataMigrationKey,
  });

  try {
    const { Item } = await ddb.send(getCommand);

    if (!Item) console.info(`No data migrations record for table ${table}`);
    return Item || dataMigrationKey;
  } catch (error) {
    console.error(`Could not get data migrations record for table ${table}`);
    throw error;
  }
};

const hasMigrationRun = async (ddb, migrationNumber, table) => {
  const migrationRecord = await getDataMigrationRecord(ddb, table);

  const hasMigrationExecuted = migrationRecord.executionState?.includes(migrationNumber);

  return !!hasMigrationExecuted;
};

const syncMigrationRecord = async (ddb, migrationNumber, table, transformed) => {
  const migrationRecord = await getDataMigrationRecord(ddb, table);
  const executionState = migrationRecord?.executionState || [];
  const migrationsRunHistory = migrationRecord ? migrationRecord.MigrationsRunHistory : {};
  const updatedItem = {
    ...migrationRecord,
    executionState: [...executionState, migrationNumber],
    MigrationsRunHistory: {
      ...migrationsRunHistory,
      [new Date().toISOString()]: {
        migrationNumber,
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

const getMigrationsRunHistory = async (ddb, table) => {
  const migrationRecord = await getDataMigrationRecord(ddb, table);
  return migrationRecord ? migrationRecord.MigrationsRunHistory : {};
};

const rollbackMigration = async (ddb, migrationNumber, table) => {
  const migrationRecord = await getDataMigrationRecord(ddb, table);
  if (!migrationRecord) {
    return;
  }
  const executionState = migrationRecord?.executionState || [];
  const updatedExecutionState = executionState.filter(
    (executedNumber) => executedNumber !== migrationNumber,
  );
  const migrationsRunHistory = migrationRecord ? migrationRecord.MigrationsRunHistory : {};

  const updatedItem = {
    ...migrationRecord,
    executionState: updatedExecutionState,
    MigrationsRunHistory: {
      ...migrationsRunHistory,
      [new Date().toISOString()]: {
        migrationNumber,
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

const getLatestDataMigrationNumber = async (ddb, table) => {
  console.info(`Getting latest data migration number for table ${table}.`);

  try {
    const migrationRecord = await getDataMigrationRecord(ddb, table);
    const latestDataMigrationNumber = migrationRecord.executionState
      ?.sort((a, b) => b - a)[0];

    if (!latestDataMigrationNumber) {
      console.info('No data migrations have been run');
      return 0;
    }
    return latestDataMigrationNumber;
  } catch (error) {
    console.error(
      `An error has occured while trying to get latest data migration number for table ${table}`,
    );
    throw error;
  }
};

module.exports = {
  getLatestDataMigrationNumber,
  getDataMigrationRecord,
  rollbackMigration,
  syncMigrationRecord,
  hasMigrationRun,
  getMigrationsRunHistory,
};
