const MIGRATION_ITEM_KEY = {
  PK: 'Migrations',
  SK: 'Migrations',
};

const hasMigrationRun = async (ddb, sequence, table) => {
  const migrationRecord = await getMigrationRecord(ddb, table);

  const isSequenceExecutedInSomeBatch = migrationRecord && Object
    .values(migrationRecord.Batches)
    .reduce((acc, val) => acc.concat(val), []).includes(sequence);

  return isSequenceExecutedInSomeBatch;
};

const setMigrationIsRun = async (ddb, batchNumber, sequence, table) => {
  const migrationRecord = await getMigrationRecord(ddb, table);
  const existingBatches = migrationRecord ? migrationRecord.Batches : {};
  const batchToUpdate = existingBatches[batchNumber] || [];
  const migrationsRunHistory = migrationRecord ? migrationRecord.MigrationsRunHistory : {};
  batchToUpdate.push(sequence);
  const updatedItem = {
    ...migrationRecord,
    ...MIGRATION_ITEM_KEY,
    Batches: {
      ...existingBatches,
      [batchNumber]: batchToUpdate,
    },
    MigrationsRunHistory: {
      ...migrationsRunHistory,
      [new Date().toISOString()]: {
        batchNumber,
        migrationNumber: sequence,
        executedCommand: 'up'
      }
    }
  };
  await ddb.put({
    TableName: table,
    Item: updatedItem,
  }).promise();
};

const removeSequenceFromBatch = async (ddb, batchNumber, sequence, table) => {
  const migrationRecord = await getMigrationRecord(ddb, table);
  if (!migrationRecord) {
    return
  }
  const sequences = migrationRecord.Batches[`${batchNumber}`]
  const index = sequences.indexOf(sequence)
  const migrationsRunHistory = migrationRecord ? migrationRecord.MigrationsRunHistory : {}

  let batches

  if (index > -1) {
    sequences.splice(index, 1)
  }
  if (!sequences.length) {
    const currentBatches = migrationRecord.Batches
    delete currentBatches[`${batchNumber}`]
    batches = currentBatches
  } else {
    batches = {
      ...migrationRecord.Batches,
      [batchNumber]: sequences,
    }
  }

  updatedItem = {
    ...migrationRecord,
    ...MIGRATION_ITEM_KEY,
    Batches: batches,
    MigrationsRunHistory: {
      ...migrationsRunHistory,
      [new Date().toISOString()]: {
        batchNumber,
        migrationNumber: sequence,
        executedCommand: 'down'
      }
    }
  }

  return await ddb.put({
    TableName: table,
    Item: updatedItem,
  }).promise()
}

const getMigrationRecord = async (ddb, table) => {
  try {
    const { Item } = await ddb.get({
      TableName: table,
      Key: MIGRATION_ITEM_KEY,
    }).promise();

    if (!Item) console.info(`No migration record for table ${table}`);
    return Item;
    
  } catch (error) {
    console.error(`Could not get migration record for table ${table}`, error);
  }
}

const getLatestBatch = async (ddb, table) => {
  try {
    const migrationRecord = await getMigrationRecord(ddb, table);

    if (!migrationRecord) {
      console.info('No latest batch');
      return;
    }
    const batches = Object.keys(migrationRecord.Batches)
      .map((batchNumber) => parseInt(batchNumber, 10))
      .sort()
      .reverse();
    const latestBatchNumber = batches[0];
    if (!latestBatchNumber) {
      console.info('No latestBatchNumber')
      return;
    }
    return {
      batchNumber: latestBatchNumber,
      sequences: migrationRecord.Batches[latestBatchNumber],
    };
  } catch (error) {
    console.error(
      `An error has occured while trying to get latest batch for table ${table}`,
      error
    );
    return;
  }
};

const removeBatch = async (ddb, batch, table) => {
  const migrationRecord = await getMigrationRecord(ddb, table);

  if (!migrationRecord) return;

  const currentBatches = migrationRecord.Batches;
  delete currentBatches[`${batch}`];
  const updatedItem = {
    ...migrationRecord,
    ...MIGRATION_ITEM_KEY,
    Batches: currentBatches
  };

  await ddb.put({
    TableName: table,
    Item: updatedItem,
  }).promise();
};

module.exports = {
  getLatestBatch,
  getMigrationRecord,
  removeBatch,
  removeSequenceFromBatch,
  setMigrationIsRun,
  hasMigrationRun
}