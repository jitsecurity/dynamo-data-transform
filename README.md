![ddt_graphic1x_tl](https://user-images.githubusercontent.com/101042972/172161782-f4a3e15c-fdf2-42f1-a14d-434b109e7d2a.png)
<p>
  <a href="https://www.jit.io/jit-open-source?utm_source=github&utm_medium=badge&utm_campaign=dynamoDataTransform&utm_id=oss">
    <img src="https://img.shields.io/badge/Secured%20by-Jit-B8287F?style=?style=plastic" /> 
    
  <a href="https://www.serverless.com">
    <img src="http://public.serverless.com/badges/v3.svg">
  </a>
    
  <a href="https://www.npmjs.com/package/dynamo-data-transform">
    <img src="https://img.shields.io/npm/dw/dynamo-data-transform">
  </a>
</p>
  


Dynamo Data Transform is an easy to use data transformation tool for DynamoDB.

It allows performing powerful data transformations using simple Javascript commands, without the risk of breaking your database.
Available as a [Serverless plugin](#-serverless-plugin), [npm package](#standalone-npm-package) and even as an [interactive CLI](#-interactive-cli), Dynamo Data Transform saves you time and keeps you safe with features like dry-running a data transformation and even rolling back your last trasnformation if needed.

**Features**

- Seemless data transformations management.
- Support for multiple stages.
- History of executed data transformations.
- Dry run option for each command (by suppling --dry flag, the data will be printed instead of stored).
- Safe & Secure preparation data
- Store preparation data in a private s3 bucket. [Prepare data for your data transformation](#usage-and-command-line-options)

## Table of contents

- [Quick Start](#quick-start)
  - [Serverless plugin](#-serverless-plugin)
  - [Standalone npm package](#standalone-npm-package)
  - [Interactive CLI](#-interactive-cli)
- [Creating your first data transformation](#creating-your-first-data-transformation)
- [Usage and command-line options](#usage-and-command-line-options)
- [What happens behind the scenes](#what-happens-behind-the-scenes)
- [Examples](#examples)
- [The data transformation process](https://github.com/jitsecurity/dynamo-data-transform/blob/main/docs/zero_downtime_data_transformation_process.md)

## Quick Start
### ⚡ Serverless plugin
- Install
```bash
npm install dynamo-data-transform --save-dev
```
- Add the tool to your serverless.yml
Run:
```bash
npx serverless plugin install -n dynamo-data-transform
```
Or add manually to your serverless.yml:
```YML
plugins:
  - dynamo-data-transform
```
- Run
```bash
sls dynamodt --help
```

### Standalone npm package
- Install the tool
```bash
npm install -g dynamo-data-transform -s
```
- Run the tool
```bash
dynamodt help
```
Or with the shortcut
```bash
ddt help
```
### 💻 Interactive CLI
After installing the npm package, run:
```bash
dynamodt -i
```
![cli gif](https://user-images.githubusercontent.com/35347793/172045910-d511e735-2d31-4713-bb64-5f55a900941c.gif)



## Creating your first data transformation
1. Intialize data-transformations folder
Serverless (the plugin reads the table names from the serverless.yml file):
```bash
sls dynamodt init --stage <stage>
```
Standalone:
```bash
ddt init --tableNames <table_names>
```

Open the generated data transformation file 'v1_script-name.js' file and implement the following functions:
  - transformUp: Executed when running `dynamodt up`
  - transformDown: Executed when running `dynamodt down -t <table>`
  - prepare (optional): Executed when running `dynamodt prepare -t <table> --tNumber <transformation_number>`

The function parameters:
  - ddb: The DynamoDB Document client object see [DynamoDB Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb)
  - isDryRun: Boolean indicating if --dry run supplied. You can use it to print/log the data instead of storing it.
  - preparationData: if you stored the preparation data using `dynamodt prepare`, you can use it here.

2. Run the data transformation
```bash
dynamodt up
```


## Data Transformation Script Format
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



## Usage and command-line options

List available commands:
Serverless plugin:
```bash
sls dynamodt --help
```
Standalone npm package:
```bash
dynamodt help
```


To list all of the options for a specific command run:
Serverless plugin:
```bash
sls dynamodt <command> --help
```

Standalone npm package:
```bash
dynamodt <command> --help
```

## What happens behind the scenes
- When a data transformation runs for the first time, a record in your table is created. This record is for tracking the executed transformations on a specific table.



## Examples
[Examples of data transformation code](https://github.com/jitsecurity/dynamo-data-transform/tree/main/examples/serverless-localstack/data-transformations/UsersExample)


### Insert records

```js
// Seed users data transformation
const { utils } = require('dynamo-data-transform');
const { USERS_DATA } = require('../../usersData');

const TABLE_NAME = 'UsersExample';

/**
 * @param {DynamoDBDocumentClient} ddb - dynamo db document client https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb
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

### Add a new field to each record
```js
// Adding a "randomNumber" field to each item
const { utils } = require('dynamo-data-transform');

const TABLE_NAME = 'UsersExample';

const transformUp = async ({ ddb, isDryRun }) => {
  const addRandomNumberField = (item) => {
    const updatedItem = { ...item, randomNumber: Math.random() };
    return updatedItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, addRandomNumberField, isDryRun);
};

const transformDown = async ({ ddb, isDryRun }) => {
  const removeRandomNumberField = (item) => {
    const { randomNumber, ...oldItem } = item;
    return oldItem;
  };
  return utils.transformItems(ddb, TABLE_NAME, removeRandomNumberField, isDryRun);
};

module.exports = {
  transformUp,
  transformDown,
  transformationNumber: 2,
};
```

For more examples of data transformation code, see the [examples](https://github.com/jitsecurity/dynamo-data-transform/tree/main/examples/serverless-localstack/data-transformations/UsersExample) folder in the repository.

