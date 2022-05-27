const path = require('path');
const fs = require('fs').promises;

const {
  BASE_MIGRATIONS_FOLDER_PATH, MIGRATION_SCRIPT_EXTENSION,
  MIGRATION_NAME_SEPARATOR, MIGRATION_NUMBER_PREFIX,
} = require('./config/constants');

const parseMigrationFileNumber = (fileName) => {
  const fileMigrationNumber = Number(
    path.basename(fileName, MIGRATION_SCRIPT_EXTENSION)
      .split(MIGRATION_NAME_SEPARATOR)[0]
      .replace(MIGRATION_NUMBER_PREFIX, ''),
  );

  return fileMigrationNumber;
};

const getTableDataMigrationFiles = async (table) => {
  const migrationFiles = await fs.readdir(path.join(BASE_MIGRATIONS_FOLDER_PATH, table));
  return migrationFiles;
};

const getDataMigrationScriptFileName = async (migrationNumber, table) => {
  const migrationFiles = await getTableDataMigrationFiles(table);
  const fileName = migrationFiles.find((currFileName) => {
    const currFileMigrationNumber = parseMigrationFileNumber(currFileName);
    return currFileMigrationNumber === migrationNumber;
  });

  if (!fileName) {
    throw new Error(`Could not find data migration script for migration number ${migrationNumber}`);
  }

  return fileName;
};

const getDataMigrationScriptFullPath = async (migrationNumber, table) => {
  const fileName = await getDataMigrationScriptFileName(migrationNumber, table);
  return path.join(BASE_MIGRATIONS_FOLDER_PATH, table, fileName);
};

module.exports = {
  parseMigrationFileNumber,
  getDataMigrationScriptFileName,
  getDataMigrationScriptFullPath,
  getTableDataMigrationFiles,
};
