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
    this.state = {isLoading: true, temporaryFavorite: 0, authUser: null, sendingFavorite: false, newFavorite: null};
    this.favoriteFormat = this.favoriteFormat.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.formatdetails + "/" + (this.props.match.params.formatId ? this.props.match.params.formatId : ""));
    this.props.firebase.getFormatMetadata(this.props.match.params.formatId)
    .then(formatDoc => {
      if (formatDoc.exists) {
        this.setState({formatData: formatDoc.data(), isLoading: false});
      }
    });
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (auth.emailVerified) {
          this.setState({authUser: auth});
        }
      }
    });
  }
  
  componentWillUnmount() {
    this.listener();
  }
  
  favoriteFormat() {
    this.setState({sendingFavorite: true});
    this.props.firebase.toggleFavoriteFormat(this.props.match.params.formatId).then(result => {
      let currentTemp = this.state.temporaryFavorite;
      currentTemp += result.data.isFavorite ? 1 : -1;
      this.setState({temporaryFavorite: currentTemp, sendingFavorite: false, newFavorite: result.data.isFavorite});
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
    const favoriteCount = (this.state.formatData.favorites ? this.state.formatData.favorites.length : 0) + this.state.temporaryFavorite;
    let favorite = false;
    if (this.state.newFavorite !== null) {
      favorite = this.state.newFavorite;
    } else if (this.state.authUser && this.state.formatData.favorites) {  
      favorite = this.state.formatData.favorites.includes(this.state.authUser.uid);
    }
    return (
      <Container className="marginTop30px">
        <Row>
          <h1>{this.state.formatData.name}</h1>
          
        </Row>
        <Row className="d-flex">
          {this.state.formatData.authorName && <Link to={ROUTES.userformat + "/" + this.state.formatData.author} data-toggle="tooltip" title="View this user's formats"><h4 className="text-muted">{this.state.formatData.authorName}</h4></Link>}
          <div className="d-flex flex-column ml-auto">
            {this.state.authUser && <Button variant="primary" onClick={this.favoriteFormat} disabled={this.state.sendingFavorite}>{favorite ? "Remove Favorite" : "Favorite Format"}</Button>}
            {!this.state.authUser && <Link to={ROUTES.signin + ROUTES.formatdetails +  encodeURIComponent("/") + this.props.match.params.formatId}><Button variant="primary">Sign in to Favorite</Button></Link>}
            <div className="text-muted text-center">{favoriteCount} have favorited</div>
          </div>
        </Row>
        <hr />
        <Row>{description}</Row>
        <Row className="mt-5"><Link to={ROUTES.deck + "/" + this.props.match.params.formatId} className="mx-auto"><Button size="lg">Create a Deck for this format</Button></Link></Row>        
      </Container>
    );
  }
}
//<Button variant="danger" className="ml-auto maxHeightFit">Report Format</Button>
export default withFirebase(withRouter(FormatDetails));