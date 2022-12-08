const batchDeleteItems = require('./batchDeleteItems');
const getTableKeySchema = require('./getTableKeySchema');
const { getUnprocessedItems } = require('./responseUtils');

const MAX_ITEMS_PER_BATCH = 25;

const deleteItems = async (ddb, tableName, items, isDryRun) => {
  if (isDryRun) {
    console.info(`Dry run: would have deleted ${items.length} items from ${tableName}`, items);
    return;
  }

  const batches = [];
  for (let i = 0; i < items.length; i += MAX_ITEMS_PER_BATCH) {
    batches.push(items.slice(i, i + MAX_ITEMS_PER_BATCH));
  }

  const keySchema = await getTableKeySchema(tableName);

  try {
    const response = await Promise.all(
      batches.map((batch) => batchDeleteItems(ddb, tableName, batch, keySchema)),
    );
    const unprocessedItems = getUnprocessedItems(response);

    if (unprocessedItems.length > 0) {
      console.error(`Failed to delete ${unprocessedItems.length} items to ${tableName}`, unprocessedItems);
    }

    return { transformed: items.length };
  } catch (error) {
    console.error(`An error has occurred in delete items for ${tableName}, ${error}`);
    throw error;
  }
};

module.exports = deleteItems;
