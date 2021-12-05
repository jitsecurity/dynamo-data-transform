const init = require('./command-handlers/init')
const up = require('./command-handlers/up')
const prepare = require('./command-handlers/prepare')
const down = require('./command-handlers/down')
const commands = require('./config/commands')

class ServerlessDynamoMigrations {
  constructor(serverless, options) {
    this.serverless = serverless
    this.provider = serverless.getProvider('aws')
    this.log = message => serverless.cli.log.bind(serverless.cli)(`Migrations - ${message}`)
    this.options = options
    this.commands = commands

    // A region environment variable is required for aws sdk
    const region = this.serverless.configurationInput.provider.region || process.env.AWS_REGION || 'us-east-1'
    process.env.AWS_REGION = region
    this.hooks = {
      'after:deploy:deploy': this.up.bind(this),
      'migration:init:init': this.init.bind(this),
      'migration:prepare:prepare': this.prepare.bind(this),
      'migration:up:migrate': this.up.bind(this),
      'migration:down:rollback': this.rollback.bind(this),
    }
  }

  async init() {
    return init(this.provider, this.options).then(() => {
      console.info('"init" command ran successfully.');
    }).catch((error) => {
      console.error(error, 'An error has occured while running migration (init).')
    })
  }

  async prepare() {
    return prepare(this.provider, this.options).then(() => {
      console.info('"prepare" command ran successfully.');
    }).catch((error) => {
      console.error(error, 'An error has occured while preparing data for migration.')
    })
  }

  async up() {
    return up(this.provider, this.options).then(() => {
      console.info('"up" command ran successfully.');
    }).catch((error) => {
      console.error(error, 'An error has occured while running migration (up).')
    })

  }

  async rollback() {
    return down(this.provider, this.options).then(() => {
      console.info('"down" command run successfully.');
    }).catch((error) => {
      console.error(error, 'An error has occured while running migration (down).')
    })
  }

}

module.exports = ServerlessDynamoMigrations;