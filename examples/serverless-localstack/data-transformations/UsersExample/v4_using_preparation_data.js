// Adding a new field "hasWikiPage"
// "hasWikiPage" is a boolean field that is set to true if the item has a wiki page
// It is calculated with a prepare function that fetches the wiki page status for each item

const { utils } = require('dynamo-data-transform');

const userAgentHeader = {
  'User-Agent': 'Chrome/81.0.4044.138',
};

const fetch = (...args) => import('node-fetch').then(({ default: nodeFetch }) => nodeFetch(
  ...args,
  {
    headers: userAgentHeader,
  },
));

const TABLE_NAME = 'UsersExample';

const transformUp = async ({ ddb, preparationData, isDryRun }) => {
  const addHasWikiPage = (hasWikiDict) => (item) => {
    const valueFromPreparation = hasWikiDict[`${item.PK}-${item.SK}`];
    const updatedItem = valueFromPreparation ? {
      ...item,
      hasWikiPage: valueFromPreparation,
    } : item;
    return updatedItem;
  };

  return utils.transformItems(
    ddb,
    TABLE_NAME,
    addHasWikiPage(JSON.parse(preparationData)),
    isDryRun,
  );
};

const transformDown = async ({ ddb, isDryRun }) => {
  const removeHasWikiPage = (item) => {
    const { hasWikiPage, ...oldItem } = item;
    return oldItem;
  };

  return utils.transformItems(ddb, TABLE_NAME, removeHasWikiPage, isDryRun);
};

const prepare = async ({ ddb }) => {
  let lastEvalKey;
  let preparationData = {};

  let scannedAllItems = false;

  while (!scannedAllItems) {
    const { Items, LastEvaluatedKey } = await utils.getItems(ddb, lastEvalKey, TABLE_NAME);
    lastEvalKey = LastEvaluatedKey;

    const currentPreparationData = await Promise.all(Items.map(async (item) => {
      const wikiItemUrl = `https://en.wikipedia.org/wiki/${item.name}`;
      const currWikiResponse = await fetch(wikiItemUrl);
      return {
        [`${item.PK}-${item.SK}`]: currWikiResponse.status === 200,
      };
    }));

    preparationData = {
      ...preparationData,
      ...currentPreparationData.reduce((acc, item) => ({ ...acc, ...item }), {}),
    };

    scannedAllItems = !lastEvalKey;
  }

  return preparationData;
};

module.exports = {
  transformUp,
  transformDown,
  prepare,
  transformationNumber: 4,
};
