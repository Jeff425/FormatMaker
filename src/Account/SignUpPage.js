import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class SignUpPageBase extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true};
  }
  
  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        this.props.history.push(ROUTES.emailverify);
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
        <div>
          <h1>Sign up to FormatMaker</h1>
            <SignUpForm firebase={this.props.firebase} />
        </div>
      </div>
    );
  }
}

class SignUpForm extends Component {
  
  constructor(props) {
    super(props);
    this.state = {email: "", pwd: "", pwd2: "", validated: false, mismatch: false, feedback: "", sending: false};
    this.onFormChange = this.onFormChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  onFormChange(event, control) {
    this.setState({[control]: event.target.value});
    if (control === "pwd" || control === "pwd2") {
      let firstPass = this.state.pwd;
      let secondPass = this.state.pwd2;
      if (control === "pwd") {
        firstPass = event.target.value;
      } else {
        secondPass = event.target.value;
      }
      if (firstPass !== secondPass) {
        this.refs.pwd2.setCustomValidity("Mismatch");
        this.setState({mismatch: true});
      } else {
        this.refs.pwd2.setCustomValidity("");
        this.setState({mismatch: false});
      }
    }
  }
  
  handleSubmit(event) {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {      
      event.stopPropagation();
    } else {
      this.setState({sending: true});
      this.props.firebase
        .createUser(this.state.email, this.state.pwd)
        .then(authUser => {
          this.setState({feedback: "Success!", sending: false});
        })
        .catch(error => {
          this.setState({feedback: error.message, sending: false});
        });
    }
    this.setState({validated: true});
  }
  
  render() {
    return (
      <Form noValidate className="singleApp" onSubmit={this.handleSubmit} validated={this.state.validated}>
        <Form.Group>
          <Form.Label>Email address</Form.Label>
          <Form.Control required type="email" value={this.state.email} onChange={event => this.onFormChange(event, "email")} placeholder="Enter email" />
          <Form.Control.Feedback type="invalid">Please enter a valid email</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control required type="password" value={this.state.pwd} onChange={event => this.onFormChange(event, "pwd")} placeholder="Enter password" />
          <Form.Control.Feedback type="invalid">Please enter a password</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control required type="password" value={this.state.pwd2} onChange={event => this.onFormChange(event, "pwd2")} placeholder="Enter password again" ref="pwd2" />
          <Form.Control.Feedback type="invalid">{this.state.mismatch ? "Please enter the same password" : "Please enter a password"}</Form.Control.Feedback>
        </Form.Group>
        {this.state.feedback && <p>{this.state.feedback}</p>}
        <Button variant="primary" type="submit" disabled={this.state.sending}>Create Account</Button>     
      </Form>
    );
  }
}

const SignUpPage = withFirebase(withRouter(SignUpPageBase));

export default SignUpPage;