# This repository shows the usage of the dynamo-data-transform package.

## Quick Start

### Initialize localstack container and dynamodb GUI
*Please make sure you have installed and running docker on your machine.
Run:
```bash
docker compose up
```

### Install dependencies
```bash
npm install
```

### Deploy service to localstack
```bash
npm start
```

Note that after running the above command, all the transformation scripts in data-transformations folder will be executed.
See the UsersExample table here:
http://localhost:8001/



#### Serverless Plugin
```bash
npx sls dynamodt --help
```

#### Interactive Cli
```bash
npm install -g dynamo-data-transform

ddt -i
```

#### Standalone npm package usage:
init - `ddt init -tableNames "Users"`
up - `ddt up`
down - `ddt down -t Users`
prepare - `ddt prepare -t Users --tNumber 3`
history - `ddt history -t Users`
```



## Exercises:
1.  For understanding how to prepare data for transformation, take a look at "v4_using_preparation_data.js"
    Move the file "v4_using_preparation_data.js" to the data-transformations folder.
    ```bash
    mv EXERCISE-prepare-data/v4_using_preparation_data.js data-transformations/UsersExample
    ```
    Let's check the prepare script results
    ```bash
    npx sls dynamodt prepare --table UsersExample --tNumber 4 --dry
    ```
    The results in the console should be:
    ```js
    {
        'USER#21-NAME#Bradley Wiggins: true,
        'USER#34-NAME#Chaos': true,
        'USER#32-NAME#Knuckles': true,
        'USER#29-NAME#Plankton': true,
        ...
    }
    ```
    Now lets prepare some data for the transformation. Run the same command as before but without --dry.
    ```bash
    npx sls dynamodt prepare --table UsersExample --tNumber 4
    ```
    Let's run the pending transformation script, currently it is "v4_using_preparation_data.js"
    ```bash
    npx sls dynamodt up --stage local
    ```
    Now open the dynamodb GUI and check the data.
    http://localhost:8001/
    
2.  Rollback the last transformation
    ```bash
    npx sls dynamodt down --stage local --table UsersExample --dry
    ```
    Now you will see in the console that "hasWikiPage" field was removed from each item.
    Lets rollback the last transformation for real.
    ```bash
    npx sls dynamodt down --stage local --table UsersExample
    ```
    Now open the dynamodb GUI and check the data.
