// Adding a "randotNumber" field to each item
const { utils } = require('dynamo-data-transform');

const TABLE_NAME = 'UsersExample';

const transformUp = async ({ ddb, isDryRun }) => {
  const addRandotNumberField = (item) => {
    const updatedItem = { ...item, randotNumber: Math.random() };
    return updatedItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, addRandotNumberField, isDryRun);
};

const transformDown = async ({ ddb, isDryRun }) => {
  const removeRandotNumberField = (item) => {
    const { randotNumber, ...oldItem } = item;
    return oldItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, removeRandotNumberField, isDryRun);
};

module.exports = {
  transformUp,
  transformDown,
  // prepare, // pass this function only if you need preparation data for the transformation
  transformationNumber: 2,
};
