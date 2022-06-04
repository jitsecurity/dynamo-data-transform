#!/usr/bin/env node
'use-strict';

const scripts = require('../src/command-handlers');
const parseArgs = require('minimist');
const { COMMAND_DESCRIPTION } = require('../src/config/commands');
const { HELP_COMMANDS } = require('./cli-commands');

const commandAliases = {
  dry: 'd',
  table: 't',
  tNumber: 'tnum',
  tableNames: 'n',
  interactive: 'i',
};

const options = parseArgs(process.argv.slice(2),{
  alias: commandAliases,
  boolean: ['dry', 'interactive', 'help'],
  string: ['table', 'tableNames'],
  number: ['tNumber'],
});

const showHelp = () => {
  console.info('Available commands:');
  Object.entries(COMMAND_DESCRIPTION).forEach(([key, value]) => {
    console.info(`  ${key} - ${value}\n`);
  });
};

(() => {
  if (options.interactive) {
    const importJsx = require('import-jsx');
    importJsx('./Components/App');
    process.exit(0);
  }

  const [command] = options._;
  if(command === 'help') {
    showHelp();
    process.exit(0);
  }

  if (command) {
    if(options.help) {
      console.info(HELP_COMMANDS[command]);
      process.exit(0);
    }
    scripts[command](options).then(() => {
      console.info(`"${command}" command run successfully.`);
      process.exit(0);
    }).catch((error) => {
      console.error(error, `An error has occured while running command (${command}).`);
      process.exit(1);
    });
  }

})();
