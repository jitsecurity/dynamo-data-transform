const {
  init, up, down, prepare, history: getHistory,
} = require('../src/command-handlers');
const commands = require('./commands');
const { getTableNames } = require('./sls-resources-parser');

class SlsDynamoDataTransformationsPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.provider = serverless.getProvider('aws');
    this.log = (message) => serverless.cli.log.bind(serverless.cli)(`Transformations - ${message}`);
    this.options = options;
    this.commands = commands;

    // A region environment variable is required for aws sdk
    const region = this.serverless.configurationInput.provider.region || process.env.AWS_REGION || 'us-east-1';
    process.env.AWS_REGION = region;
    this.hooks = {
      'after:deploy:deploy': this.up.bind(this),
      'dynamodt:init:init': this.init.bind(this),
      'dynamodt:prepare:prepare': this.prepare.bind(this),
      'dynamodt:up:transform': this.up.bind(this),
      'dynamodt:down:rollback': this.rollback.bind(this),
      'dynamodt:history:history': this.getHistory.bind(this),
    };
  }

  async init() {
    const resources = this.provider.serverless.service.resources.Resources;
    const tableNames = getTableNames(resources);

    return init({ tableNames }).then(() => {
      console.info('"init" command ran successfully.');
    }).catch((error) => {
      console.error('An error has occured while running dynamodt (init).', error.message);
    });
  }

  async prepare() {
    return prepare(this.options).then(() => {
      console.info('"prepare" command ran successfully.');
    }).catch((error) => {
      console.error('An error has occured while running dynamodt (prepare).', error.message);
    });
  }

  async up() {
    return up(this.options).then(() => {
      console.info('"up" command ran successfully.');
    }).catch((error) => {
      console.error('An error has occured while running dynamodt (up).', error.message);
    });
  }

  async rollback() {
    return down(this.options).then(() => {
      console.info('"down" command run successfully.');
    }).catch((error) => {
      console.error('An error has occured while running dynamodt (down).', error.message);
    });
  }

  async getHistory() {
    return getHistory(this.options).then(() => {
      console.info('"history" command run successfully.');
    }).catch((error) => {
      console.error('An error has occured while running dynamodt (history).', error.message);
    });
  }
}

module.exports = SlsDynamoDataTransformationsPlugin;
