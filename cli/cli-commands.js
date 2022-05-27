const COMMAND_OPTIONS = {
  dry: {
    type: 'boolean', name: 'dry', label: 'Specify if you want a dry run', initialValue: true,
  },
  table: {
    type: 'string', name: 'table', label: 'Specify table name', initialValue: '',
  },
  mNumber: {
    type: 'string', name: 'mNumber', label: 'Specify the version of current migration e.g "2"', initialValue: 1,
  },
  tableNames: {
    type: 'string', name: 'tableNames', label: 'Specify table names e.g "table1, table2"', initialValue: '',
  },
};

const CLI_COMMANDS = {
  up: "up",
  down: "down",
  history: "history",
  prepare: "prepare",
  init: "init",
};

const CLI_FORM = {
  [CLI_COMMANDS.up]: {
    title: 'Up Parameters',
    fields: [
      COMMAND_OPTIONS.dry,
    ],
  },
  [CLI_COMMANDS.down]: {
    title: 'Down Parameters',
    fields: [
      COMMAND_OPTIONS.table,
      COMMAND_OPTIONS.dry,
    ],
  },
  [CLI_COMMANDS.prepare]: {
    title: 'Preparetion Parameters',
    fields: [
      COMMAND_OPTIONS.table,
      COMMAND_OPTIONS.mNumber,
      COMMAND_OPTIONS.dry,
    ],
  },
  [CLI_COMMANDS.history]: {
    title: 'History Parameters',
    fields: [
      COMMAND_OPTIONS.table,
    ],
  },
  [CLI_COMMANDS.init]: {
    title: 'Init Parameters',
    fields: [
      COMMAND_OPTIONS.tableNames,
    ],
  },
};

const CLI_COMMAND_OPTIONS = Object.values(CLI_COMMANDS).map((command) => {
  return {
    label: command,
    value: command,
  };
});

module.exports = {
  COMMAND_OPTIONS,
  CLI_FORM,
  CLI_COMMAND_OPTIONS,
  CLI_COMMANDS,
};
