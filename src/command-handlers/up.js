const fs = require('fs').promises;
const { getLatestBatch, hasMigrationRun, syncMigrationRecord } = require('../services/dynamodb/migrations-executions-manager');
const { getDynamoDBClient } = require('../clients');
const { getDataFromS3Bucket } = require('../services/s3');

const MIGRATIONS_FOLDER_NAME = 'migrations';

const baseMigrationsFolderPath = `${process.cwd()}/${MIGRATIONS_FOLDER_NAME}`;

const migrate = async (ddb, migration, table, isDryRun) => {
  const { sequence, transformUp, prepare } = migration;
  const isMigrationRun = await hasMigrationRun(ddb, sequence, table);

  if (!isMigrationRun) {
    let preparationData = {};
    const shouldUsePreparationData = Boolean(prepare);
    if (shouldUsePreparationData) {
      const preparationFilePath = `${table}/v${sequence}`;
      preparationData = await getDataFromS3Bucket(preparationFilePath);
      console.info('Migrating using preparation data');
    }

    const transformationResponse = await transformUp(ddb, preparationData, isDryRun);
    if (!isDryRun) {
      // TODO: add support for batches, currently only one migration per batch is supported
      const batch = sequence;
      await syncMigrationRecord(ddb, batch, sequence, table, transformationResponse?.transformed);
    } else {
      console.info("It's a dry run");
    }
  } else {
    console.info(`Migration ${sequence} has already been executed for table ${table}`);
  }
};

const getMigrationsForCurrentTable = async (table, latestBatch) => {
  try {
    const nextSequence = latestBatch ? latestBatch.sequences.sort().reverse()[0] + 1 : 1;

    const migrationFiles = await fs.readdir(`${baseMigrationsFolderPath}/${table}`);

    const jsFiles = migrationFiles.filter((f) => f.endsWith('.js'));

    const sortedMigrations = jsFiles
      .map((fileName) => require(`${baseMigrationsFolderPath}/${table}/${fileName}`))
      .sort((a, b) => a.sequence - b.sequence);

    const filteredMigrationsByNextSequence = sortedMigrations.filter(
      (m) => m.sequence >= nextSequence,
    );

    console.debug(`Number of migration files to execute - ${filteredMigrationsByNextSequence.length} for table ${table}.`);
    return filteredMigrationsByNextSequence;
  } catch (error) {
    console.error(`Could not get migrations for current table - ${table}, latestBatch: ${JSON.stringify(latestBatch)}`, error);
    throw error;
  }
};

const up = async ({ dry: isDryRun }) => {
  const ddb = getDynamoDBClient();

  const tables = await fs.readdir(baseMigrationsFolderPath);
  console.info(`Available tables for migration ${tables || 'No tables found'}.`);

  return Promise.all(tables.map(async (table) => {
    console.info(`Getting latest batch of migration for table ${table}.`);
    const latestBatch = await getLatestBatch(ddb, table);
    const migrationsToExecute = await getMigrationsForCurrentTable(table, latestBatch);

    for (const migration of migrationsToExecute) {
      console.info('Started migration ', migration.sequence, table);
      await migrate(ddb, migration, table, isDryRun);
    }
  }));
};

module.exports = up;
