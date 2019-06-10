import React, { Component } from 'react';
import ReactGA from 'react-ga';
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
    ReactGA.pageview(ROUTES.formatdetails + "/" + (this.props.match.params.formatId ? this.props.match.params.formatId : ""));
    this.props.firebase.getFormatMetadata(this.props.match.params.formatId)
    .then(formatDoc => {
      if (formatDoc.exists) {
        this.setState({formatData: formatDoc.data()});
        this.props.firebase.getUserInfo(formatDoc.data().author)
        .then(userInfo => {
          this.setState({isLoading: false, authorName: userInfo.displayName});
        });
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
    let description = this.state.formatData.description;
    if (this.state.formatData.longDescription) {
      description = <ReactMarkdown source={this.state.formatData.longDescription} linkTarget="_blank" />;
    }
    return (
      <Container className="marginTop30px">
        <Row>
          <h1>{this.state.formatData.name}</h1>
          
        </Row>
        {this.state.authorName && <Row><Link to={ROUTES.userformat + "/" + this.state.formatData.author} data-toggle="tooltip" title="View this user's formats"><h4 className="text-muted">{this.state.authorName}</h4></Link></Row>}
        <hr />
        <Row>{description}</Row>
        <Row className="mt-5"><Link to={ROUTES.deck + "/" + this.props.match.params.formatId} className="mx-auto"><Button size="lg">Create a Deck for this format</Button></Link></Row>        
      </Container>
    );
  }
}
//<Button variant="danger" className="ml-auto maxHeightFit">Report Format</Button>

export default withFirebase(withRouter(FormatDetails));