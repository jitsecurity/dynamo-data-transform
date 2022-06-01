const { utils } = require('dynamo-data-transform');

const TABLE_NAME = '{{YOUR_TABLE_NAME}}';

/**
 * @param {DynamoDBDocumentClient} ddb - dynamo db client of @aws-sdk https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-dynamodb
 * @param {boolean} isDryRun
 * @returns {{transformed: number}}
 *
 */
const transformUp = async ({ ddb, isDryRun }) => {
  // Replace this with your own logic
  const addNewFieldToItem = (item) => {
    const updatedItem = { ...item, newField: 'value' };
    return updatedItem;
  };
  return utils.transformItems(ddb, isDryRun, TABLE_NAME, addNewFieldToItem);
};

const transformDown = async ({ ddb, isDryRun }) => {
  // Replace this function with your own logic
  const removeFieldFromItem = (item) => {
    const { newField, ...oldItem } = item;
    return oldItem;
  };
  return utils.transformItems(ddb, isDryRun, TABLE_NAME, removeFieldFromItem);
};

module.exports = {
  transformUp,
  transformDown,
  // prepare, // pass this function only if you need preparation data for the migration
  migrationNumber: 1,
};

/**
 * For more data migration scripts examples, see:
 * https://github.com/jitsecurity/dynamo-data-transform/tree/main/examples
 *
 */
