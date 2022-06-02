// Split full name of every record into first and last name
const { utils } = require('dynamo-data-transform');

const TABLE_NAME = 'UsersExample';

const transformUp = async ({ ddb, isDryRun }) => {
  const addFirstAndLastName = (item) => {
    // Just for the example:
    // Assume that the FullName has one space between first and last name
    const [firstName, ...lastName] = item.name.split(' ');
    return {
      ...item,
      firstName,
      lastName: lastName.join(' '),
    };
  };
  return utils.transformItems(ddb, TABLE_NAME, addFirstAndLastName, isDryRun);
};

const transformDown = async ({ ddb, isDryRun }) => {
  const removeFirstAndLastName = (item) => {
    const { firstName, lastName, ...oldItem } = item;
    return oldItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, removeFirstAndLastName, isDryRun);
};

module.exports = {
  transformUp,
  transformDown,
  transformationNumber: 3,
};
