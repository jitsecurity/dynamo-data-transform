const MIGRATION_ITEM_KEY = {
  PK: 'Migrations',
  SK: 'Migrations',
}

const hasMigrationRun = async (ddb, sequence, table) => {
  const { Item } = await ddb.get({
    TableName: table,
    Key: MIGRATION_ITEM_KEY,
  }).promise();

  const isSequenceExecutedInSomeBatch = Item && Object
    .values(Item.Batches)
    .reduce((acc, val) => acc.concat(val), []).includes(sequence)

  return isSequenceExecutedInSomeBatch
}

const setMigrationIsRun = async (ddb, batchNumber, sequence, table) => {
  const { Item } = await ddb.get({
    TableName: table,
    Key: MIGRATION_ITEM_KEY,
  }).promise()
  const existingBatches = Item ? Item.Batches : {}
  const batchToUpdate = existingBatches[batchNumber] || []
  const migrationsRunHistory = Item ? Item.MigrationsRunHistory : {}
  batchToUpdate.push(sequence)
  const updatedItem = {
    ...Item,
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
  }
  await ddb.put({
    TableName: table,
    Item: updatedItem,
  }).promise()
}

const removeSequenceFromBatch = async (ddb, batchNumber, sequence, table) => {
  const { Item } = await ddb.get({
    TableName: table,
    Key: MIGRATION_ITEM_KEY,
  }).promise()
  if (!Item) {
    return
  }
  const sequences = Item.Batches[`${batchNumber}`]
  const index = sequences.indexOf(sequence)
  const migrationsRunHistory = Item ? Item.MigrationsRunHistory : {}

  let batches

  if (index > -1) {
    sequences.splice(index, 1)
  }
  if (!sequences.length) {
    const currentBatches = Item.Batches
    delete currentBatches[`${batchNumber}`]
    batches = currentBatches
  } else {
    batches = {
      ...Item.Batches,
      [batchNumber]: sequences,
    }
  }

  updatedItem = {
    ...Item,
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

const getLatestBatch = async (ddb, table) => {
  try {
    const response = await ddb.get({
      TableName: table,
      Key: MIGRATION_ITEM_KEY,
    }).promise()

    const { Item } = response

    if (!Item) {
      console.info('No latest batch')
      return
    }
    const batches = Object.keys(Item.Batches)
      .map((batchNumber) => parseInt(batchNumber, 10))
      .sort()
      .reverse()
    const latestBatchNumber = batches[0]
    if (!latestBatchNumber) {
      console.info('No latestBatchNumber')
      return
    }
    return {
      batchNumber: latestBatchNumber,
      sequences: Item.Batches[latestBatchNumber],
    }
  } catch (error) {
    console.error(
      `An error has occured while trying to get latest batch for table ${table}`,
      error
    )
    return
  }
}

const removeBatch = async (ddb, batch, table) => {
  const { Item } = await ddb.get({
    TableName: table,
    Key: MIGRATION_ITEM_KEY,
  }).promise()

  if (!Item) {
    return
  }

  const currentBatches = Item.Batches
  delete currentBatches[`${batch}`]
  const updatedItem = {
    ...Item,
    ...MIGRATION_ITEM_KEY,
    Batches: currentBatches
  }

  await ddb.put({
    TableName: table,
    Item: updatedItem,
  }).promise()
}

module.exports = {
  getLatestBatch,
  removeBatch,
  removeSequenceFromBatch,
  setMigrationIsRun,
  hasMigrationRun
}