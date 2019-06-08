import React, { Component } from 'react';
import moment from 'moment';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { withFirebase } from './Firebase/FirebaseContext';

class Changelog extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, changes: []};
  }
  
  componentDidMount() {
    this.props.firebase.queryChangelog()
    .then(result => result.docs)
    .then(changeQuery => {
      const changes = changeQuery.filter(doc => doc.exists).map(doc => { return {...doc.data()}; });
      this.setState({isLoading: false, changes: changes});
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
      <Container>
        <h1 className="text-center marginTop30px">Changelog</h1>
        <Col className="mt-4">
          {this.state.changes && this.state.changes.map(change => (
            <Row className="flex-column mb-3">
              <h3>{moment(change.date.toDate()).format("LL")}</h3>
              <div className="ml-3">{change.description}</div>
            </Row>
          ))}
        </Col>
      </Container>
    );
  }
}

export default withFirebase(Changelog);