# DynamoDB data transformations Tool

<p>
  <a href="https://www.serverless.com">
    <img src="http://public.serverless.com/badges/v3.svg">
  </a>
</p>

## Introduction: 
- We design our databases schemas and define how we want to store the data inside. \
We hope that our design will last forever, \
however, in the real world, it might not happen. \
Making changes in our database design is a regular process that happens sometimes.

- We need to be able to execute data transformations \
  without interfering with us or our clients \
  and without losing the ability to get back to the previous state of the data.

![:)](./docs/images/undraw_data_extraction_re_0rd3.svg)

## Quick Start:
### Serverless plugin:
- Install
```bash
npm install dynamo-data-transform --save-dev
```
- Add the tool to your serverless.yml
```YML
plugins:
  - dynamo-data-transform
```
- Run
```bash
sls dynamodt list
```

### Standalone npm package:
- Install the tool
```bash
npm install -g dynamo-data-transform
```
- Run the tool
```bash
dynamodt --help
```
Or with the shortcut
```bash
ddt --help
```
- Use the interactive cli
```bash
dynamodt -i
```




**Features**

- Seemless data transformations management.
- Support for multiple stages.
- History of executed data transformations.
- Dry run option for each command (by suppling --dry flag, the data will be printed instead of stored).
- Safe & Secure preparation data - \
  Store preparation data in a private s3 bucket. \
  [Prepare data for your data transformation](#usage-and-command-line-options)



## Documentation

- [Introduction:](#introduction)
- [Documentation](#documentation)
- [Installation](#installation)
- [Usage and command-line options](#usage-and-command-line-options)
- [What it does behind the scenes:](#what-it-does-behind-the-scenes)
- [The data transformation process:](#the-data-transformation-process)
  - [Steps](#steps)
    - [First Phase:](#first-phase)
    - [The Second Phase (data transformation):](#the-second-phase-data-transformation)
  - [Key Concepts](#key-concepts)
  - [Troubleshooting](#troubleshooting)
  - [Examples](#examples)



## Usage and command-line options

List available commands:
Serverless plugin:
```bash
sls dynamodt --help
```
Standalone npm package:
```bash
dynamodt list
```


To list all of the options for a specific command run:
Serverless plugin:
```bash
sls dynamotdt <command> --help
```

## What it does behind the scenes
- When a data transformation is running for the first time a Record in your table is created. \
  This record is for tracking the executed transformations on a specific table.


## The safe data transformation process
The next section describes how the process looks like and the order of every step in the data transformation process.
### Steps
#### First Phase (Add New Resources)
1. Update the serverless.yml resources (if needed) \
   Reminder: we are not overriding existing data but creating new. [See some examples](#examples)
1. Your new code should be able to write to your old and new resources which ensures that we can roll back to the previous state and prevent possible data gaps.
1. Create a pull request and deploy it to every stage in your application

#### The Second Phase (data transformation)

1. For the first time use `sls dynamodt init` it will generate a folder per table inside the root folder of your service (The name of the folder is the exact name of the table).
A template data transformation file (v1.js) will be created in each table folder. \
Implement these functions:
    1. `transformUp` - transform all of the table items to the new shape (use preparationData if needed).
    1. `transformDown` - transform all of the table items to the previous shape.
    1. `prepare` - use this function whenever your data transformation relies on data from external resources.

1. Export these functions and export the version of the current data transformation (set the sequence variable value. It should be the same number of the file name).

1. Preparing data from external resources for the data transformation can be done by using `sls dynamodt prepare`

    Run `sls dynamodt prepare --tNumber <transformation_number> --table <table>`\
    The data will be stored in a S3 bucket  \
    The data will be decrypted while running the data transformation script.

1. **Final Step** Create a pull request. \
   Note that the data transformation runs after an sls deploy command it is integrated \
   with lifecycle of serverless `after:deploy:deploy` hook.

#### The Third Phase (Use The New Resources/Data):
1. Adjust your code to work with the new data. \
   For example, read from the new index instead of the old one.
1. Create a pull request with the updated lambdas.


#### The Fourth Phase (Cleanup):
1. Clean the unused data (attributes/indexes/etc). 


### Key Concepts 
First of all, keep in mind that our mission is to prevent downtime while executing data transformations.
- Don't override resources/data
- Your code should be able to work with the old version of the data and keep it updated.
- To be continued...

### Troubleshooting
Credentials error:
#### Required environment variables: #Move it to the tool docs
```bash
# configure aws credentials aws configure or use environment variables
export AWS_ACCESS_KEY_ID=<your-access-key-id>
export AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
export AWS_DEFAULT_REGION=<your-region>

#[OPTIONAL] 
# Required for preparing data for the migration
# The default is migrations-preparation-data
# Make sure you have created the bucket before running the migration
export PREPARATION_DATA_BUCKET=<your-bucket-name>
```

### Data Transformation Script Format (e.g v1_script.js)
```js
const { utils } = require('dynamo-data-transform')

const TABLE_NAME = 'UsersExample'

const transformUp = async ({ ddb, isDryRun, preparationData }) => {
  // your code here... 
  // return { transformed: 50 } // return the number of transformed items
}

const transformDown = async ({ ddb, isDryRun, preparationData }) => {
  // your code here...
  // return { transformed: 50 } // return the number of transformed items
}

const prepare = async ({ ddb, isDryRun }) => {
  // your code here...
  // return { transformed: 50 } // return the number of transformed items
}

module.exports = {
  transformUp,
  transformDown,
  prepare, // optional
  transformationNumber: 1,
}
```


### Examples
Examples of data transformation code:
https://github.com/jitsecurity/dynamo-data-transform/tree/main/examples/serverless-localstack/data-transformations


#### Insert records

```js
// Seed users data transformation
const { utils } = require('dynamo-data-transform');
const { USERS_DATA } = require('../../usersData');

const TABLE_NAME = 'UsersExample';

/**
 * @param {DynamoDBDocumentClient} ddb - dynamo db document client https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-dynamodb
 * @param {boolean} isDryRun - true if this is a dry run
 */
const transformUp = async ({ ddb, isDryRun }) => {
  return utils.insertItems(ddb, TABLE_NAME, USERS_DATA, isDryRun);
};

const transformDown = async ({ ddb, isDryRun }) => {
  return utils.deleteItems(ddb, TABLE_NAME, USERS_DATA, isDryRun);
};

module.exports = {
  transformUp,
  transformDown,
  transformationNumber: 1,
};
```

#### Add a new field to each record
```js
// Adding a "randotNumber" field to each item
const { utils } = require('dynamo-data-transform');

const TABLE_NAME = 'UsersExample';

const transformUp = async ({ ddb, isDryRun }) => {
  const addRandotNumberField = (item) => {
    const updatedItem = { ...item, randotNumber: Math.random() };
    return updatedItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, addRandotNumberField, isDryRun);
};

const transformDown = async ({ ddb, isDryRun }) => {
  const removeRandotNumberField = (item) => {
    const { randotNumber, ...oldItem } = item;
    return oldItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, removeRandotNumberField, isDryRun);
};

module.exports = {
  transformUp,
  transformDown,
  // prepare, // pass this function only if you need preparation data for the transformation
  transformationNumber: 2,
};
```

#### Add field using preparation data (s3 bucket)
```js
// Adding a new field "hasWikiPage"
// "hasWikiPage" is a boolean field that is set to true if the item has a wiki page
// It is calculated with a prepare function that fetches the wiki page status for each item

const { utils } = require('dynamo-data-transform');

const userAgentHeader = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
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
```

For more examples of data transformation code, see the examples folder in the repository.
