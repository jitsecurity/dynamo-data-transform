const { utils } = require('@jitsecurity/dynamodb-data-migrations');

const TABLE_NAME = '{{YOUR_TABLE_NAME}}';

const up = (item) => {
  // Adding a new field to the item example
  const updatedItem = { ...item, newField: 'value' };
  return updatedItem;
};

const transformUp = async (ddb, preparationData, isDryRun) => {
  return utils.transformItems(ddb, isDryRun, TABLE_NAME, up);
};

const down = (item) => {
  const { newField, ...oldItem } = item;
  return oldItem;
};

const transformDown = async (ddb, isDryRun) => {
  return utils.transformItems(ddb, isDryRun, TABLE_NAME, down);
};

module.exports = {
  transformUp,
  transformDown,
  // prepare, // pass this function only if you need preparation data for the migration
  sequence: 1, // the migration number
};
