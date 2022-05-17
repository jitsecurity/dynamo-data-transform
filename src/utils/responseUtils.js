const getUnprocessedItems = (response) => {
  const unprocessedItems = response.reduce((acc, { UnprocessedItems }) => {
    if (Object.keys(UnprocessedItems)?.length) {
      acc.push(UnprocessedItems);
    }
    return acc;
  }, []);

  return unprocessedItems;
};

module.exports = {
  getUnprocessedItems,
};
