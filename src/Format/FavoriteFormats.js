import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import FormatCard from './FormatCard';

class FavoriteFormats extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formats: []};
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.favorites);
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (!auth.emailVerified) {
          this.props.history.push(ROUTES.emailverify);
          return;
        }
        this.props.firebase.queryFavoriteFormats()
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
    });
  }
  
  componentWillUnmount() {
    this.listener();
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
        <h1>Your Favorite Formats</h1>
        <div className="d-flex flex-row flex-wrap">
        {this.state.formats.map(format => (
          <FormatCard format={format} key={format.id} />
        ))}
        </div>
      </div>
    );
  }
}

export default withFirebase(withRouter(FavoriteFormats));