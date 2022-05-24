const { ResourceNotFoundException } = require('@aws-sdk/client-dynamodb');

const ddbErrorsWrapper = (func) => {
  return async (...args) => {
    try {
      return await func(...args);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new Error('Table does not exist. Please verify the table name.');
      }
      throw error;
    }
  };
};

module.exports = {
  ddbErrorsWrapper,
};
