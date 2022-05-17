'use-strict';

const React = require('react');
const { Text } = require('ink');
const Gradient = require('ink-gradient');


class BigTextErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {error: ""};
    }
  
    componentDidCatch(error) {
      this.setState({error: `${error.name}: ${error.message}`});
    }
  
    render() {
      const {error} = this.state;
      if (error) {
        return (
            <Gradient name="rainbow">
                <Text>{this.props.text || 'text'}</Text>
            </Gradient>
        );
      } else {
        return <>{this.props.children}</>;
      }
    }
  }

module.exports = BigTextErrorBoundary;