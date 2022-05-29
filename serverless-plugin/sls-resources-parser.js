const getTableNames = (resources) => {
  return Object.values(resources)
    .filter((rValue) => rValue.Type === 'AWS::DynamoDB::Table')
    .map((rValue) => rValue.Properties.TableName);
};

module.exports = {
  getTableNames,
};
