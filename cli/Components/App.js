'use-strict';

const React = require('react');
const importJsx = require('import-jsx');
const { render, Newline } = require('ink');

const Menu = importJsx('./Menu');
const CommandForm = importJsx('./CommandForm');
const Title = importJsx('./Title');
const BigTextErrorBoundary = importJsx('./BigTextErrorBoundary');

const App = () => {
  const [selection, setSelection] = React.useState(null);

  return (
    <>
      <BigTextErrorBoundary text='Dynamo Data Transform' key='keyfortitle'>
        <Title text='Dynamo Data Transform' />
      </BigTextErrorBoundary>
      <Newline />
      {selection ? (
        <CommandForm selection={selection} setSelection={setSelection} />
      ) : (
        <Menu setSelection={setSelection} />
      )}
    </>
  );
};

render(<App />);
