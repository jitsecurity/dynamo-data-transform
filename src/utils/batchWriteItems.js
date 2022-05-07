const { BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

const batchWriteItems = async (ddb, tableName, items) => {
    const params = {
        RequestItems: {
            [tableName]: items.map(item => ({
                PutRequest: {
                    Item: item
                }
            })),
        },
        ReturnConsumedCapacity: "TOTAL",
        ReturnItemCollectionMetrics: "SIZE",
    };
    const batchWriteCommand = new BatchWriteCommand(params);
    return await ddb.send(batchWriteCommand);
}

module.exports = batchWriteItems;
