'use-strict';

const React = require('react');
const { Text } = require('ink');

const { Form } = require('ink-form');
const scripts = require('../../src/command-handlers');
const { CLI_FORM } = require('../cli-commands');

const getForm = (selection) => {
  return {
    form: {
      title: 'Please fill the following fields',
      sections: [CLI_FORM[selection]],
    },
  };
};

const CommandForm = ({ selection, setSelection }) => {
  const handleSubmit = (values) => {
    const script = scripts[selection];
    script(values).then(() => {
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
