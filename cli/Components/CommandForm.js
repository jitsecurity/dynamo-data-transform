'use-strict';

const React = require('react');
const { Text } = require('ink');

const { Form } = require('ink-form');
const scripts = require('../../src/command-handlers');
const { CLI_FORM, CLI_COMMANDS } = require('../cli-commands');

const getForm = (selection) => {
  return {
    form: {
      title: 'Please fill the following fields',
      sections: [CLI_FORM[selection]],
    },
  };
};

const convertStringValueToArray = (values) => {
  const valuesArray = Object.keys(values).map((key) => {
    if (typeof values[key] === 'string') {
      return values[key]
        .replace(/ /g,'') // remove empty spaces
        .split(',');
    }
    return values[key];
  });
  return valuesArray;
};

const buildScriptParameters = (selection, values) => {
  let parameters = values;
  if (selection === CLI_COMMANDS.init) {
    // convert tableNames to array of table names (table1,table2 -> ['table1', 'table2'])
    parameters = convertStringValueToArray(values);
  }
  return parameters;
};

const CommandForm = ({ selection, setSelection }) => {
  const handleSubmit = (values) => {
    const params = buildScriptParameters(selection, values);
    const script = scripts[selection];
    script(params).then(() => {
      setSelection(null);
    }).catch((error) => {
      console.error(error, `An error has occured while running migration (${selection}).`);
    });
  };

  return (
    <>
      <Text>{selection}</Text>
      <Form {...getForm(selection)} onSubmit={handleSubmit} />
    </>
  );
};

module.exports = CommandForm;
