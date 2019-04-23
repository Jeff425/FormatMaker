import React, { Component } from 'react';

class TitledDivider extends Component {
  render() {
    return (
      <div className="viewport fullWidth">
        <h5 className="mb-0">{this.props.title}</h5>
        <hr className="mb-1 mt-1 fullWidth" />
      </div>
    );
  }
}

export default TitledDivider;