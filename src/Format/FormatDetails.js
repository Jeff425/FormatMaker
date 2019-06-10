import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { Link, withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ReactMarkdown from 'react-markdown';
import ROUTES from './../ROUTES';

class FormatDetails extends Component {
  
  constructor(props) {
    super(props);
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
    let description = <h5>{this.state.formatData.description}</h5>;
    if (this.state.formatData.longDescription) {
      description = <h5><ReactMarkdown source={this.state.formatData.longDescription} linkTarget="_blank" /></h5>;
    }
    return (
      <Container className="marginTop30px">
        <Row>
          <h1>{this.state.formatData.name}</h1>
          
        </Row>
        
        <hr />
        
        <Row>{description}</Row>
        <Row className="mt-3"><Link to={ROUTES.deck + "/" + this.props.match.params.formatId} className="mx-auto"><Button size="lg">Create Deck for this format</Button></Link></Row>        
      </Container>
    );
  }
}
//<Button variant="danger" className="ml-auto maxHeightFit">Report Format</Button>
//<Row><h4>Description:</h4></Row>
//<Row><h3 className="text-muted">By: Test User</h3></Row>
export default withFirebase(withRouter(FormatDetails));