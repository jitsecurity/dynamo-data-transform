# DynamoDB Data Migrations Tool

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

- We need to be able to execute data migrations \
  without interfering with us or our clients \
  and without losing the ability to get back to the previous state of the data.

![:)](./docs/images/undraw_data_extraction_re_0rd3.svg)

## Quick Start:
### Serverless plugin:
- Install the tool:
```bash
npm install dynamodb-data-migrations --save-dev
```
- Add the tool to your serverless.yml:
```YML
plugins:
  - dynamodb-data-migrations
```
- Run the tool:
```bash
sls migration list
```

### Standalone npm package:
- Install the tool:
```bash
npm install -g dynamodb-data-migrations
```
- Run the tool:
```bash
dynamodb-data-migrations --help
```
Or with the shortcut:
```bash
ddm --help
```
- Use the interactive cli:
```bash
dynamodb-data-migrations -i
```




**Features**

- Seemless data migrations management for every stage.
- Safe & Secure preparation data - \
  Store preparation data in a private s3 bucket & .
- Custom commands for executing data migrations from your local machine (if needed).
- Dry run option for every command (by suppling --dry flag the data will be printed instead of stored).


## Documentation

- [Introduction:](#introduction)
- [Documentation](#documentation)
- [Installation](#installation)
- [Usage and command-line options](#usage-and-command-line-options)
- [What it does behind the scenes:](#what-it-does-behind-the-scenes)
- [The data migration process:](#the-data-migration-process)
  - [Steps](#steps)
    - [First Phase:](#first-phase)
    - [The Second Phase (Data Migration):](#the-second-phase-data-migration)
  - [Key Concepts](#key-concepts)
  - [Troubleshooting](#troubleshooting)
  - [Examples](#examples)



## Usage and command-line options

List available commands:
Serverless plugin:
```bash
sls migration --help
```
Standalone npm package:
```bash
dynamodb-data-migrations list
```


To list all of the options for a specific command run:
Serverless plugin:
```bash
sls migration <command> --help
```
Standalone npm package:
```bash
dynamodb-data-migrations <command> --help
```

## What it does behind the scenes
- When migration is running for the first time a Record in your table is created. \
  This record is for tracking the executed migrations on a specific table.


## The data migration process
The next section describes how the process looks like and the order of every step in the migration process.
### Steps
#### First Phase (Add New Resources)
1. Update the serverless.yml resources (if needed) \
   Reminder: we are not overriding existing data but creating new. [See some examples](#examples)
1. Your new code (lambdas) should be able to write to your old and new resources which ensures that we can roll back easily to the previous state and prevent possible data gaps while updating the lambdas.
1. Create a pull request and deploy it to every stage in your application

#### The Second Phase (Data Migration)

1. For the first time use `sls migration init` it will generate a folder per table inside the root folder of your service (The name of the folder is the exact name of the table).
A template migration file (v1.js) will be created in each table folder. \
Implement these functions:
    1. `transformUp` - transform all of the table items to the new shape (use preparationData if needed).
    1. `transformDown` - transform all of the table items to the previous shape.
    1. `prepare` - use this function whenever your migration relies on data from external resources.

1. Export these functions and export the version of the current migration (set the sequence variable value. It should be the same number of the file name).

1. Preparing data from external resources for the migration can be done by using `sls migration prepare`

    Run `sls migration prepare -p $(pwd)/migrations/{{YOUR_TABLE_NAME}}/v1.js`\
    The data will be stored encrypted in this format: {{FILE_VERSION}}.{{ENV}}.encrypted (e.g v1.local.encrypted) \
    The data will be decrypted while running the migration script.

1. **Final Step** Create a pull request. \
   Note that the migration runs after an sls deploy command it is integrated \
   with lifecycle hooks of serverless `after:deploy:deploy` hook.

#### The Third Phase (Use The New Resources/Data):
1. Adjust your code to work with the new data. \
   For example, read from the new index instead of the old one.
1. Create a pull request with the updated lambdas.


#### The Fourth Phase (Cleanup):
1. Clean the unused data (attributes/indexes/etc). 


### Key Concepts 
First of all, keep in mind that our mission is to prevent downtime while executing data migrations.
- Don't override resources/data
- Your code should be able to work with the old version of the data and keep it updated.
- To be continued...

### Troubleshooting
To be continued


### Examples

- Required functions to implement by the plugin user examples
1. async transformUp
```javascript 
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
```

2. async transformDown
```javascript
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
```
- To be continued
<!-- - `sls migration up --stage local` -  -->
