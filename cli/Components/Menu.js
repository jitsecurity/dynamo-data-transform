'use-strict';

const React = require('react');
const { Text } = require('ink');
const SelectInput = require('ink-select-input').default;

const { CLI_COMMAND_OPTIONS } = require('../cli-commands');

const Menu = ({ setSelection }) => {
  const handleSelect = item => {
    setSelection(item.value);
  };

  return (
    <>
      <Text color={'yellow'}>Select a command:</Text>
      <SelectInput items={CLI_COMMAND_OPTIONS} onSelect={handleSelect} />
    </>
  );
};

module.exports = Menu;