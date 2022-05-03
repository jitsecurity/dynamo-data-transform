const prepare = async (ddb) => {
  //Implement your preparation logic here
}

const up = async (item, prepationDataForItem) => {
  //Implement your transform logic for specific item here
}

const down = (item) => {
  //Implement your transform logic for specific item here
}

const getItems = async (ddb, lastEvalKey) => {
  return await ddb.scan({
    TableName: '{{YOUR_TABLE_NAME}}',
    FilterExpression: 'begins_with(#sk, :sk_prefix)',
    ExclusiveStartKey: lastEvalKey,
    ExpressionAttributeNames: {
      "#sk": "SK",
    },
    ExpressionAttributeValues: {
      ":sk_prefix": "YOUR_PREFIX",
    }
  }).promise();
}

const transformUp = async (ddb, preparationData, isDryRun) => {
  let lastEvalKey
  do {
    const { Items, LastEvaluatedKey } = await getItems(ddb, lastEvalKey)
    lastEvalKey = LastEvaluatedKey

    const updatedItems = await Promise.all(Items.map(async (item) => {
      const itemPrimaryKey = `${item.PK}-${item.SK}`
      const prepationDataForItem = preparationData[itemPrimaryKey]
      const updatedItem = prepationDataForItem ? await up(item, prepationDataForItem) : item
      return updatedItem
    }))

    if (!isDryRun) {
      await save(ddb, updatedItems)
    } else {
      console.info(updatedItems, 'updatedItems')
    }
  } while (lastEvalKey)
}

const transformDown = async (ddb, isDryRun) => {
  let lastEvalKey
  do {
    const { Items, LastEvaluatedKey } = await getItems(ddb, lastEvalKey)
    lastEvalKey = LastEvaluatedKey

    const updatedItems = await Promise.all(Items.map(async (item) => {
      return await down(item)
    }))

    if (!isDryRun) {
      await save(ddb, updatedItems)
    } else {
      console.info(updatedItems, 'updatedItems')
    }
  } while (lastEvalKey)
}

const save = async (ddb, items) => {
  return await Promise.all(items.map((item) =>
    ddb.put({
      TableName: '{{YOUR_TABLE_NAME}}',
      Item: item,
    }).promise()
  ))
}

module.exports = {
  transformUp,
  transformDown,
  // prepare, // pass this function only if you need preparation data for the migration
  sequence: 1, // the migration number
}