const prepare = async (ddb) => {

}

const up = async (item, prepationDataForItem) => {

}

const down = (item) => {

}

const getItems = async (ddb, lastEvalKey) => {
  return await ddb.scan({
    TableName: 'ENTER_YOUR_TABLE_NAME',
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
      TableName: 'ENTER_YOUR_TABLE_NAME',
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