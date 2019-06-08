import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';

class FormatDetails extends Component {
  
  constructor(props) {
    super(props);
    console.log("yep");
    this.state = {isLoading: true};
  }
  
  componentDidMount() {
    this.props.firebase.getFormatMetadata(this.props.match.params.formatId)
    .then(formatDoc => {
      if (formatDoc.exists) {
        this.setState({isLoading: false, formatData: formatDoc.data()});
      }
    });
  }
  
  render() {
    if (this.state.isLoading) {
      return (
        <div className="main-page">
          <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
        </div>
      );
    }
    return (
      <Container className="marginTop30px">
        <Row>
          <h1>{this.state.formatData.name}</h1>
          <Button variant="danger" className="ml-auto maxHeightFit">Report Format</Button>
        </Row>
        <Row><h3 className="text-muted">By: Test User</h3></Row>
        <hr />
        <Row><h4>Summary:</h4></Row>       
        <Row><h5>{this.state.formatData.description}</h5></Row>
      </Container>
    );
  }
}

export default withFirebase(withRouter(FormatDetails));