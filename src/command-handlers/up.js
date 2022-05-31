const path = require('path');
const fs = require('fs').promises;
const { getLatestDataMigrationNumber, hasMigrationRun, syncMigrationRecord } = require('../services/dynamodb/migrations-executions-manager');
const { getDynamoDBClient } = require('../clients');
const { getDataFromS3Bucket } = require('../services/s3');
const { BASE_MIGRATIONS_FOLDER_PATH, MIGRATION_SCRIPT_EXTENSION } = require('../config/constants');
const { ddbErrorsWrapper } = require('../services/dynamodb');
const { parseMigrationFileNumber, getTableDataMigrationFiles } = require('../data-migration-script-explorer');

const executeDataMigration = async (ddb, migration, table, isDryRun) => {
  const { migrationNumber, transformUp, prepare } = migration;
  const isMigrationRun = await hasMigrationRun(ddb, migrationNumber, table);

  if (!isMigrationRun) {
    let preparationData = {};
    const shouldUsePreparationData = Boolean(prepare);
    if (shouldUsePreparationData) {
      const preparationFilePath = `${table}/v${migrationNumber}`;
      preparationData = await getDataFromS3Bucket(preparationFilePath);
      console.info('Running data migration script using preparation data');
    }

    const transformationResponse = await transformUp({ ddb, preparationData, isDryRun });
    if (!isDryRun) {
      await syncMigrationRecord(ddb, migrationNumber, table, transformationResponse?.transformed);
    } else {
      console.info("It's a dry run");
    }
  } else {
    console.info(`Data Migration script ${migrationNumber} has already been executed for table ${table}`);
  }
};

const isGreaterThanLatestMigrationNumber = (fileName, latestDataMigrationNumber) => {
  const migrationFileNumber = parseMigrationFileNumber(fileName);
  return migrationFileNumber > latestDataMigrationNumber;
};

const getScriptsToExecuteForTable = async (table, latestDataMigrationNumber) => {
  try {
    const migrationFiles = await getTableDataMigrationFiles(table);

    const currentMigrationFiles = migrationFiles.filter((fileName) => {
      const isJsFile = path.extname(fileName) === MIGRATION_SCRIPT_EXTENSION;
      return isJsFile && isGreaterThanLatestMigrationNumber(fileName, latestDataMigrationNumber);
    });

    const sortedMigrationFiles = currentMigrationFiles.sort();

    const scriptsToExecute = sortedMigrationFiles
      .map((fileName) => require(
        path.join(BASE_MIGRATIONS_FOLDER_PATH, table, fileName),
      ));

    console.info(`Number of data migration scripts to execute - ${scriptsToExecute.length} for table ${table}.`);
    return scriptsToExecute;
  } catch (error) {
    console.error(`Could not get data migrations scripts for current table - ${table}, latest data migration number: ${latestDataMigrationNumber}`);
    throw error;
  }
};

const up = async ({ dry: isDryRun }) => {
  const ddb = getDynamoDBClient();

  const tables = await fs.readdir(BASE_MIGRATIONS_FOLDER_PATH);
  console.info(`Available tables for migration: ${tables || 'No tables found'}.`);

  return Promise.all(tables.map(async (table) => {
    const latestDataMigrationNumber = await getLatestDataMigrationNumber(ddb, table);
    const migrationsToExecute = await getScriptsToExecuteForTable(
      table,
      latestDataMigrationNumber,
    );

    for (const migration of migrationsToExecute) {
      console.info('Started data migration ', migration.migrationNumber, table);
      await executeDataMigration(ddb, migration, table, isDryRun);
    }
  }));
};

module.exports = ddbErrorsWrapper(up);
