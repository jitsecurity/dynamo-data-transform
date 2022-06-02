// Adding a "randomNumber" field to each item
const { utils } = require('dynamo-data-transform');

const TABLE_NAME = 'UsersExample';

const transformUp = async ({ ddb, isDryRun }) => {
  const addRandomNumberField = (item) => {
    const updatedItem = { ...item, randomNumber: Math.random() };
    return updatedItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, addRandomNumberField, isDryRun);
};

const transformDown = async ({ ddb, isDryRun }) => {
  const removeRandomNumberField = (item) => {
    const { randomNumber, ...oldItem } = item;
    return oldItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, removeRandomNumberField, isDryRun);
};

module.exports = {
  transformUp,
  transformDown,
  // prepare, // pass this function only if you need preparation data for the transformation
  transformationNumber: 2,
};
