import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class EmailVerify extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, emailVerified: false, error: "", email: ""};
  }
  
  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (auth.emailVerified) {
          this.setState({isLoading: false, emailVerified: true});
        } else {
          auth.sendEmailVerification()
          .then(() => {
            this.setState({isLoading: false, email: auth.email});
            this.listener();
            this.props.firebase.signOut();
          })
          .catch(error => {
            this.setState({isLoading: false, error: "Error sending email verification: " + error.code});
          });
        }
      } else {
        this.props.history.push(ROUTES.signin);
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
    if (this.state.emailVerified) {
      return (
        <div className="main-page">
          <h5>Email has been verified</h5>
        </div>
      );
    }
    if (this.state.error) {
      return (
        <div className="main-page">
          <h5>{this.state.error}</h5>
        </div>
      );
    }
    return (
      <div className="main-page">
        <h5>{"Sent email verification to " + this.state.email}</h5>
      </div>
    );
  }
}

export default withRouter(withFirebase(EmailVerify));