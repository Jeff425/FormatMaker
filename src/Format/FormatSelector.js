import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import FormatCard from './FormatCard';

class FormatSelector extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formats: [], isAuthed: false, isLoadingSponsored: true, sponsoredFormats: []};
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.deck);
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
    this.props.firebase.getSponsoredFormats() //curently only 1 format
    .then(doc => {
      const format = {...doc.data()};
      format.id = doc.id;
      this.setState({isLoadingSponsored: false, sponsoredFormats: [format]});
    });
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (auth.emailVerified) {
          this.setState({isAuthed: true});
        }
      }
    });
  }
  
  render() {
    if (this.state.isLoading || this.state.isLoadingSponsored) {
      return (
        <div className="main-page">
          <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
        </div>
      );
    }
    return (
      <div className="AppContainer fullWidth">
        <h1>Select a format</h1>
        {this.state.isAuthed && <h4>You may view your own formats <Link to={ROUTES.ownformat}>here</Link></h4>}
        <div className="d-flex flex-row flex-wrap">
        {this.state.sponsoredFormats.map(format => (
          <FormatCard format={format} key={format.id} />
        ))}
        {this.state.formats.map(format => (
          <FormatCard format={format} key={format.id} />
        ))}
        </div>
      </div>
    );
  }
}

export default withFirebase(FormatSelector);