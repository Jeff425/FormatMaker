import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link, withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class SignInPageBase extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true};
  }
  
  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        this.props.history.push("/" + (this.props.match.params.redirect ? decodeURIComponent(this.props.match.params.redirect) : ""));
      } else {
        this.setState({isLoading: false});
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
      <div className="main-page">
        <div className="singleApp">
          <h1>Sign in to FormatMaker</h1>
          <SignInForm firebase={this.props.firebase} />
          <p className="mt-3">Don't have an account? <Link to={ROUTES.signup}>Sign Up Here</Link></p>
          <p className="mt-3"><Link to={ROUTES.passwordforget}>Forgot Password?</Link></p>
        </div>
      </div>
    );
  }
}

class SignInForm extends Component {
  
  constructor(props) {
    super(props);
    this.state = {email: "", pwd: "", feedback: "", sending: false, validated: false};
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  onFormChange(event, control) {
    this.setState({[control]: event.target.value});
  }
  
  handleSubmit(event) {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {      
      event.stopPropagation();
    } else {
      this.setState({sending: true});
      this.props.firebase
        .signIn(this.state.email, this.state.pwd)
        .then(authUser => {
          this.setState({feedback: "Success!", sending: false});
        })
        .catch(error => {
          if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
            this.setState({feedback: "Invalid Email or Password", sending: false});
          } else {
            this.setState({feedback: error.message, sending: false});
          }
        });
    }
    this.setState({validated: true});
  }
  
  render() {
    return (
      <Form noValidate onSubmit={this.handleSubmit} validated={this.state.validated}>
        <Form.Group>
          <Form.Label>Email address</Form.Label>
          <Form.Control required type="email" placeholder="Enter email" onChange={event => this.onFormChange(event, "email")} value={this.state.email} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control required type="password" placeholder="Enter password" onChange={event => this.onFormChange(event, "pwd")} value={this.state.pwd} />
        </Form.Group>
        {this.state.feedback && <p>{this.state.feedback}</p>}
        <Button variant="primary" type="submit" disabled={this.state.sending}>Sign in</Button>
      </Form>
    );
  }
}

const SignInPage = withFirebase(withRouter(SignInPageBase));

export default SignInPage;