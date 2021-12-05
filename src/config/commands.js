module.exports = {
  migration: {
    usage: "Runs database migrations",
    commands: {
      init: {
        usage: "sls migration init - Create a migrations folder with tables and initialized scripts",
        lifecycleEvents: ["init"],
      },
      up: {
        usage: "sls migration up --stage local - Runs the next migration",
        lifecycleEvents: ["migrate"],
        options: {
          dry: {
            usage: '--dry',
            shortcut: 'd',
            required: false,
            type: 'boolean'
          }
        }
      },
      prepare: {
        usage: "sls migration prepare -p $(pwd)/migrations/{{YOUR_TABLE}}/v1.js --mVersion v1 - Prepare data for migration pass full path of the prepatation script",
        lifecycleEvents: ["prepare"],
        options: {
          preparationPath: {
            usage: 'Specify the path of the preparation function \n (e.g. "--preparationPath /Users/Guy/a-service/migrations/v1.js")',
            shortcut: 'p',
            required: true,
            type: 'string',
          },
          mVersion: {
            usage: 'Specify the version of current migration (e.g. "--mVersion v1")',
            required: true,
            type: 'string',
          },
          stage: {
            usage: 'Specify the current stage (local | dev | staging | prod)',
            shortcut: 's',
            required: true,
            type: 'string',
          },
          dry: {
            usage: '--dry',
            shortcut: 'd',
            required: false,
            type: 'boolean'
          }
        }
      },
      down: {
        usage: "Rolls back a specific migration",
        lifecycleEvents: ["rollback"],
        options: {
          table: {
            usage: 'Specify the name of the table (e.g. "--table TABLE_NAME")',
            shortcut: 't',
            required: true,
            type: 'string',
          },
          mVersion: {
            usage: 'Specify the version of current migration (e.g. "--mVersion v1")',
            shortcut: 'mv',
            required: true,
            type: 'string',
          },
          dry: {
            usage: '--dry',
            shortcut: 'd',
            required: false,
            type: 'boolean'
          }
        }
      },

    }
  }
}