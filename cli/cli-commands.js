const COMMAND_OPTIONS = {
  dry: {
    type: 'boolean', name: 'dry', label: 'Specify if you want a dry run', initialValue: true,
  },
  table: {
    type: 'string', name: 'table', label: 'Specify table name', initialValue: '',
  },
  mVersion: {
    type: 'string', name: 'mVersion', label: 'Specify the version of current migration', initialValue: '',
  },
  tableNames: {
    type: 'string', name: 'tableNames', label: 'Specify table name', initialValue: '',
  },
};

const CLI_FORM = {
  up: {
    title: 'Up Parameters',
    fields: [
      COMMAND_OPTIONS.dry,
    ],
  },
  down: {
    title: 'Down Parameters',
    fields: [
      COMMAND_OPTIONS.table,
      COMMAND_OPTIONS.dry,
    ],
  },
  prepare: {
    title: 'Preparetion Parameters',
    fields: [
      COMMAND_OPTIONS.table,
      COMMAND_OPTIONS.mVersion,
      COMMAND_OPTIONS.dry,
    ],
  },
  history: {
    title: 'History Parameters',
    fields: [
      COMMAND_OPTIONS.table,
    ],
  },
  init: {
    title: 'Init Parameters',
    fields: [
      COMMAND_OPTIONS.tableNames, // fix
    ],
  },
};

const CLI_COMMAND_OPTIONS = Object.keys(CLI_FORM).map((command) => {
  return {
    label: command,
    value: command,
  };
});

module.exports = {
  COMMAND_OPTIONS,
  CLI_FORM,
  CLI_COMMAND_OPTIONS,
};
