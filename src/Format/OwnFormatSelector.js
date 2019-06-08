import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import FormatCard from './FormatCard';

class OwnFormatSelector extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formats: [], authUser: null, error: ""};
    this.loadFormats = this.loadFormats.bind(this);
    this.removeFormat = this.removeFormat.bind(this);
    this.deleteSuccess = this.deleteSuccess.bind(this);
    this.deleteError = this.deleteError.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.ownformat);
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (!auth.emailVerified) {
          this.props.history.push(ROUTES.emailverify);
          return;
        }
        this.setState({authUser: auth});
        this.loadFormats(auth);
      } else {
        this.props.history.push(ROUTES.signin + ROUTES.ownformat);
      }
    });
  }
  
  loadFormats(auth) {
    this.props.firebase.queryFormats(auth)
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
  
  removeFormat(formatId) {
    if (this.state.authUser) {
      this.setState({isLoading: true});
      this.props.firebase.deleteFormat(this.state.authUser, formatId, this.deleteSuccess, this.deleteError);
    }
  }
  
  deleteSuccess() {
    this.loadFormats(this.state.authUser);
  }
  
  deleteError(errorMsg) {
    this.setState({error: errorMsg});
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
    if (this.state.formats.length < 1) {
      return (
        <div className="main-page">
          <h1>No Formats Found</h1>
          <h6>You may create one <Link to={ROUTES.format}>here</Link></h6>
        </div>
      );
    }
    return (
      <div className="AppContainer fullWidth">
        <h1>Select a format</h1>
        {this.state.error && <Alert dismissible variant="danger" className="fullWidth ml-3 mr-3" onClose={() => this.setState({error: ""})}>
          <Alert.Heading>Error deleting format</Alert.Heading>
          <p>{this.state.error}</p>
        </Alert>}
        <div className="d-flex flex-row flex-wrap">
        {this.state.formats.map(format => (
          <FormatCard format={format} removeFormat={this.removeFormat} key={format.id} />
        ))}
        </div>
      </div>
    );
  }
}

export default withFirebase(OwnFormatSelector);