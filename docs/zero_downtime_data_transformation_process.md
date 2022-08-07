# Zero down time data transformation process
The next section describes how the data transformation process looks like, and the order of each step.

[Process Steps](#steps)
[Troubleshooting](#troubleshooting)
[Key Concepts](#key-concepts)
## Steps
### 1st Phase (Add New Resources)
1. Update the table resources if needed \
   Reminder: we are not overriding existing data but creating new.
1. Your new code should be able to write to your old and new resources which ensures that we can roll back to the previous state and prevent possible data gaps.
1. Create a pull request and deploy it to every stage in your application

### 2nd Phase (data transformation)

1. For the first time use `sls dynamodt init` it will generate a folder per table inside the root folder of your service (The name of the folder is the exact name of the table).
A template data transformation file (v1.js) will be created in each table folder. \
Implement these functions:
    1. `transformUp` - transform all of the table items to the new shape (use preparationData if needed).
    1. `transformDown` - transform all of the table items to the previous shape.
    1. `prepare` - use this function whenever your data transformation relies on data from external resources.

1. Export these functions and export the version of the current data transformation (set the sequence variable value. It should be the same value as that of the file name).

1. Preparing data from external resources for the data transformation can be done by using `sls dynamodt prepare`

    Run `sls dynamodt prepare --tNumber <transformation_number> --table <table>`\
    The data will be stored in a S3 bucket  \
    The data will be decrypted while running the data transformation script.

1. **Final Step** Create a pull request. \
   Note that the data transformation runs after an sls deploy command it is integrated \
   with lifecycle of serverless `after:deploy:deploy` hook.

### 3rd Phase (Use The New Resources/Data)
1. Adjust your code to work with the new data. \
   For example, read from the new index instead of the old one.
1. Create a pull request with the updated lambdas.


### 4th Phase (Cleanup)
1. Clean the unused data (attributes/indexes/etc). 


### Key Concepts 
- Don't override resources/data
- Your code should be able to work with the old version of the data and keep it updated.
- Prefer multiple data transformations over complex one.
