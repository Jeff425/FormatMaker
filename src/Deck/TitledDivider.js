import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class TitledDivider extends Component {
  render() {
    let titleLine = <h5 className="mb-0">{this.props.title}</h5>;
    if (this.props.link) {
      titleLine = <Link to={this.props.link}>{titleLine}</Link>
    }
    return (
      <div className="fullWidth">
        {titleLine}
        <hr className="mb-1 mt-1 fullWidth" />
      </div>
    );
  }
}

export default TitledDivider;