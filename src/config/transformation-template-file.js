const { utils } = require('dynamo-data-transform');

const TABLE_NAME = '{{YOUR_TABLE_NAME}}';

/**
 * @param {DynamoDBDocumentClient} ddb - dynamo db client of @aws-sdk https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb
 * @param {boolean} isDryRun
 * @returns the number of transformed items { transformed: number }
 *
 */
const transformUp = async ({ ddb, isDryRun }) => {
  // Replace this with your own logic
  const addNewFieldToItem = (item) => {
    const updatedItem = { ...item, newField: 'value' };
    return updatedItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, addNewFieldToItem, isDryRun);
};

const transformDown = async ({ ddb, isDryRun }) => {
  // Replace this function with your own logic
  const removeFieldFromItem = (item) => {
    const { newField, ...oldItem } = item;
    return oldItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, removeFieldFromItem, isDryRun);
};

module.exports = {
  transformUp,
  transformDown,
  // prepare, // export this function only if you need preparation data for the transformation
  transformationNumber: 1,
};

/**
 * For more data transformation scripts examples, see:
 * https://github.com/jitsecurity/dynamo-data-transform/tree/main/examples/serverless-localstack
 *
 */
