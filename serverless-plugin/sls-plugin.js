const {
  init, up, down, prepare, history: getHistory,
} = require('../src/command-handlers');
const commands = require('../src/config/commands');
const utils = require('../src/utils'); // export from core package

class ServerlessDynamoMigrations {
  static utils = utils;
  constructor(serverless, options) {
    this.serverless = serverless;
    this.provider = serverless.getProvider('aws');
    this.log = (message) => serverless.cli.log.bind(serverless.cli)(`Migrations - ${message}`);
    this.options = options;
    this.commands = commands;

    // A region environment variable is required for aws sdk
    const region = this.serverless.configurationInput.provider.region || process.env.AWS_REGION || 'us-east-1';
    process.env.AWS_REGION = region;
    this.hooks = {
      'after:deploy:deploy': this.up.bind(this),
      'migration:init:init': this.init.bind(this),
      'migration:prepare:prepare': this.prepare.bind(this),
      'migration:up:migrate': this.up.bind(this),
      'migration:down:rollback': this.rollback.bind(this),
      'migration:history:history': this.getHistory.bind(this),
    };
  }

  async init() {
    const getTableNames = (resources) => {
      // TODO: Move this function to a more appropriate place
      return Object.values(resources)
        .filter((rValue) => rValue.Type === 'AWS::DynamoDB::Table')
        .map((rValue) => rValue.Properties.TableName);
    };

    const resources = this.provider.serverless.service.resources.Resources;
    const tableNames = getTableNames(resources);

    return init({ tableNames }).then(() => {
      console.info('"init" command ran successfully.');
    }).catch((error) => {
      console.error('An error has occured while running migration (init).', error.message);
    });
  }

  async prepare() {
    return prepare(this.options).then(() => {
      console.info('"prepare" command ran successfully.');
    }).catch((error) => {
      console.error('An error has occured while preparing data for migration.', error.message);
    });
  }

  async up() {
    return up(this.options).then(() => {
      console.info('"up" command ran successfully.');
    }).catch((error) => {
      console.error('An error has occured while running migration (up).', error.message);
    });
  }

  async rollback() {
    return down(this.options).then(() => {
      console.info('"down" command run successfully.');
    }).catch((error) => {
      console.error('An error has occured while running migration (down).', error.message);
    });
  }

  async getHistory() {
    return getHistory(this.options).then(() => {
      console.info('"history" command run successfully.');
    }).catch((error) => {
      console.error('An error has occured while running migration (history).', error.message);
    });
  }
}

module.exports = ServerlessDynamoMigrations;
