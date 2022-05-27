#!/usr/bin/env node
'use-strict';

const scripts = require('../src/command-handlers');
const parseArgs = require('minimist')

const commandAliases = {
  dry: 'd',
  table: 't',
  mNumber: 'm',
  tableNames: 'n',
  interactive: 'i',
};

const options = parseArgs(process.argv.slice(2),{
  alias: commandAliases,
  boolean: ['dry', 'interactive'],
  string: ['table', 'tableNames'],
  number: ['mNumber'],
});

if (options.interactive) {
  const importJsx = require('import-jsx');
  importJsx('./Components/App');
} else {
  const [command] = options._;

  scripts[command](options).then(() => {
    console.info(`"${command}" command run successfully.`);
    process.exit(0);
  }).catch((error) => {
    console.error(error, `An error has occured while running migration (${command}).`);
    process.exit(1);
  });
}


