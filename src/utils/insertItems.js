const batchWriteItems = require('./batchWriteItems');
const { getUnprocessedItems } = require('./responseUtils');

const MAX_ITEMS_PER_BATCH = 25;

const insertItems = async (ddb, tableName, items, isDryRun) => {
  if (isDryRun) {
    console.info(`Dry run: would have seeded ${items.length} items to ${tableName}`, items);
    return;
  }

  const batches = [];
  for (let i = 0; i < items.length; i += MAX_ITEMS_PER_BATCH) {
    batches.push(items.slice(i, i + MAX_ITEMS_PER_BATCH));
  }

  try {
    const response = await Promise.all(
      batches.map((batch) => batchWriteItems(ddb, tableName, batch)),
    );
    const unprocessedItems = getUnprocessedItems(response);

    if (unprocessedItems.length > 0) {
      console.error(`Failed to seed ${unprocessedItems.length} items to ${tableName}`, JSON.stringify(unprocessedItems, null, 2));
    }

    return { transformed: items.length };
  } catch (error) {
    console.error(`An error has occured in seed items for ${tableName}`);
    throw error;
  }
};

module.exports = insertItems;
