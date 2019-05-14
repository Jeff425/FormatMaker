import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

export const withHideApp = (InnerComponent, name) => class extends Component {
  constructor(props) {
    super(props);
    this.state = {hide: false};
  }
  
  render() {
    if (this.state.hide) {
      return <div className="AppContainer"><Button onClick={() => this.setState({hide: false})}>{"Show " + name}</Button></div>
    }
    return <InnerComponent {...this.props}><Button className="phoneOnly" onClick={() => this.setState({hide: true})}>{"Hide " + name}</Button></InnerComponent>
  }
}