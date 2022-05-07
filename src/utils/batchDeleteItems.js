const { BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

const batchDeleteItems = async (ddb, tableName, items) => {
    const params = {
        RequestItems: {
            [tableName]: items.map(item => ({
                DeleteRequest: {
                    Key: {
                        // todo - add support for custom composite keys
                        PK: item.PK,
                        SK: item.SK,
                    }

                }
            })),
        },
        ReturnConsumedCapacity: "TOTAL",
        ReturnItemCollectionMetrics: "SIZE",
    };
    const batchWriteCommand = new BatchWriteCommand(params);
    return await ddb.send(batchWriteCommand);
}

module.exports = batchDeleteItems;
