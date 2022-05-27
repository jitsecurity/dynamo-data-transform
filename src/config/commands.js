const COMMAND_OPTIONS = {
  dry: {
    usage: '--dry',
    shortcut: 'd',
    required: false,
    type: 'boolean',
  },
  table: {
    usage: 'Specify the name of the table (e.g. "--table TABLE_NAME")',
    shortcut: 't',
    required: true,
    type: 'string',
  },
  mNumber: {
    usage: 'Specify the version of current migration (e.g. "--mNumber 1")',
    required: true,
    type: 'string',
  },
  tableNames: {
    type: 'string', name: 'tableNames', label: 'Specify table name', initialValue: '',
  },
};

module.exports = {
  migration: {
    usage: 'Runs database migrations',
    commands: {
      init: {
        usage: 'sls migration init - Create a migrations folder with tables and initialized scripts',
        lifecycleEvents: ['init'],
      },
      up: {
        usage: 'sls migration up --stage local - Runs the next migration',
        lifecycleEvents: ['migrate'],
        options: {
          dry: COMMAND_OPTIONS.dry,
        },
      },
      prepare: {
        usage: 'sls migration prepare -p $(pwd)/migrations/{{YOUR_TABLE}}/v1.js --mNumber v1 - Prepare data for migration pass full path of the prepatation script',
        lifecycleEvents: ['prepare'],
        options: {
          mNumber: COMMAND_OPTIONS.mNumber,
          dry: COMMAND_OPTIONS.dry,
          table: COMMAND_OPTIONS.table,
        },
      },
      down: {
        usage: 'Rolls back a specific migration',
        lifecycleEvents: ['rollback'],
        options: {
          table: COMMAND_OPTIONS.table,
          dry: COMMAND_OPTIONS.dry,
        },
      },
      history: {
        usage: 'sls migration history -t {{YOUR_TABLE}} - Show the history of migrations',
        lifecycleEvents: ['history'],
        options: {
          table: COMMAND_OPTIONS.table,
        },
      },
    },
  },
};
