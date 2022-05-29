const { COMMAND_DESCRIPTION } = require('../src/config/commands');

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
    type: 'number',
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
        usage: `sls migration init - ${COMMAND_DESCRIPTION.init}`,
        lifecycleEvents: ['init'],
      },
      up: {
        usage: `sls migration up - ${COMMAND_DESCRIPTION.up}`,
        lifecycleEvents: ['migrate'],
        options: {
          dry: COMMAND_OPTIONS.dry,
        },
      },
      prepare: {
        usage: `"sls migration prepare --table {{TABLE_NAME}} --mNumber 1" - ${COMMAND_DESCRIPTION.prepare}`,
        lifecycleEvents: ['prepare'],
        options: {
          mNumber: COMMAND_OPTIONS.mNumber,
          dry: COMMAND_OPTIONS.dry,
          table: COMMAND_OPTIONS.table,
        },
      },
      down: {
        usage: `sls migration down --table {{TABLE_NAME}} - ${COMMAND_DESCRIPTION.down}`,
        lifecycleEvents: ['rollback'],
        options: {
          table: COMMAND_OPTIONS.table,
          dry: COMMAND_OPTIONS.dry,
        },
      },
      history: {
        usage: `sls migration history --table {{TABLE_NAME}} -  ${COMMAND_DESCRIPTION.history}`,
        lifecycleEvents: ['history'],
        options: {
          table: COMMAND_OPTIONS.table,
        },
      },
    },
  },
};
