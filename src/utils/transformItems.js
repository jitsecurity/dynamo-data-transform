const getItems = require("./getItems");
const batchWriteItems = require("./batchWriteItems");

const transformItems = async (ddb, tableName, transformer, isDryRun) => {
  let lastEvalKey, transformedItemsKeys = [];

  do {
    const { Items, LastEvaluatedKey } = await getItems(ddb, lastEvalKey, tableName);
    lastEvalKey = LastEvaluatedKey;

    const updatedItems = Items.map(transformer);

    if (!isDryRun) {
      const response = await batchWriteItems(ddb, tableName, updatedItems);
      transformedItemsKeys = transformedItemsKeys.concat(updatedItems.map(item => item.PK + '-' + item.SK));
    } else {
      console.info(updatedItems, 'updatedItems');
      // fs.writeFileSync('./updatedItems.json', JSON.stringify(updatedItems, null, 2))
    }
  } while (lastEvalKey);

  return { transformed: transformedItemsKeys };
};

module.exports = transformItems