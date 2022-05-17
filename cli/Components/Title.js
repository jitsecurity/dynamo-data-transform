'use-strict';

const React = require('react');
const { Static } = require('ink');
const Gradient = require('ink-gradient');
const BigText = require('ink-big-text');

const Title = ({ text }) => {
  return (
    
      <Static items={[text]} >
        {(item) => (
          <Gradient key={item} name="rainbow">
                <BigText font='tiny' text={item} />
          </Gradient>
        )}
      </Static>
  );
};

module.exports = Title;