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
  tNumber: {
    usage: 'Specify the version of current transformation (e.g. "--tNumber 1")',
    required: true,
    type: 'number',
  },
  tableNames: {
    type: 'string', name: 'tableNames', label: 'Specify table name', initialValue: '',
  },
};

module.exports = {
  dynamodt: {
    usage: 'Run data transformations',
    commands: {
      init: {
        usage: `sls dynamodt init - ${COMMAND_DESCRIPTION.init}`,
        lifecycleEvents: ['init'],
      },
      up: {
        usage: `sls dynamodt up - ${COMMAND_DESCRIPTION.up}`,
        lifecycleEvents: ['transform'],
        options: {
          dry: COMMAND_OPTIONS.dry,
        },
      },
      prepare: {
        usage: `"sls dynamodt prepare --table {{TABLE_NAME}} --tNumber 1" - ${COMMAND_DESCRIPTION.prepare}`,
        lifecycleEvents: ['prepare'],
        options: {
          tNumber: COMMAND_OPTIONS.tNumber,
          dry: COMMAND_OPTIONS.dry,
          table: COMMAND_OPTIONS.table,
        },
      },
      down: {
        usage: `sls dynamodt down --table {{TABLE_NAME}} - ${COMMAND_DESCRIPTION.down}`,
        lifecycleEvents: ['rollback'],
        options: {
          table: COMMAND_OPTIONS.table,
          dry: COMMAND_OPTIONS.dry,
        },
      },
      history: {
        usage: `sls dynamodt history --table {{TABLE_NAME}} -  ${COMMAND_DESCRIPTION.history}`,
        lifecycleEvents: ['history'],
        options: {
          table: COMMAND_OPTIONS.table,
        },
      },
    },
  },
};
