// Seed users data transformation
const { utils } = require('dynamo-data-transform');

const { USERS_DATA } = require('../../usersData');

const TABLE_NAME = 'UsersExample';

/**
 * @param {DynamoDBDocumentClient} ddb - dynamo db document client https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-dynamodb
 * @param {boolean} isDryRun - true if this is a dry run
 */
const transformUp = async ({ ddb, isDryRun }) => {
  return utils.insertItems(ddb, TABLE_NAME, USERS_DATA, isDryRun);
};

const transformDown = async ({ ddb, isDryRun }) => {
  return utils.deleteItems(ddb, TABLE_NAME, USERS_DATA, isDryRun);
};

module.exports = {
  transformUp,
  transformDown,
  transformationNumber: 1,
};
