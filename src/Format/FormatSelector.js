import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import FormatCard from './FormatCard';

class FormatSelector extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formats: [], isAuthed: false};
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
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (auth.emailVerified) {
          this.setState({isAuthed: true});
        }
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
      <div className="AppContainer fullWidth">
        <h1>Select a format</h1>
        {this.state.isAuthed && <h4>You may view your own formats <Link to={ROUTES.ownformat}>here</Link></h4>}
        <div className="d-flex flex-row flex-wrap">
        {this.state.formats.map(format => (
          <FormatCard format={format} />
        ))}
        </div>
      </div>
    );
  }
}

export default withFirebase(FormatSelector);