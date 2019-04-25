import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class FormatSelector extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formats: []};
  }
  
  componentDidMount() {
    this.props.firebase.queryFormats()
    .then(result => result.docs)
    .then(formatQuery => {
      const formats = formatQuery.filter(doc => doc.exists).map(doc => {
        const format = {...doc.data()};
        format.id = doc.id;
        return format;
      });
      this.setState({isLoading: false, formats: formats});
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
      <div className="AppContainer fullWidth">
        <h1>Select a format</h1>
        <div className="d-flex flex-row flex-wrap">
        {this.state.formats.map(format => (
          <Card key={format.id} className="formatCard ml-3 mr-3 mt-3">
            <Card.Body className="d-flex flex-column">
              <Card.Title>{format.name}</Card.Title>
              <Card.Text>{format.description}</Card.Text>
              <Card.Link as={Link} to={ROUTES.deck + "/" + format.id} className="mt-auto">Select Format</Card.Link>
            </Card.Body> 
          </Card>
        ))}
        </div>
      </div>
    );
  }
}

export default withFirebase(FormatSelector);