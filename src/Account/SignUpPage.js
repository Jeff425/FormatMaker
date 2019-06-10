import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import { privacyTitle, privacyBody } from './PrivacyPolicy';
import { termsTitle, termsBody } from './TermsOfService';
import DocumentModal from './DocumentModal';

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
        <div className="singleApp">
          <h1>Sign up to FormatBuilder</h1>
          <SignUpForm firebase={this.props.firebase} />
        </div>
      </div>
    );
  }
}

class SignUpForm extends Component {
  
  constructor(props) {
    super(props);
    this.state = {email: "", pwd: "", pwd2: "", displayName: "", validated: false, mismatch: false, feedback: "", sending: false, showModal: false, modalTitle: "", modalBody: ""};
    this.onFormChange = this.onFormChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.showPrivacyModal = this.showPrivacyModal.bind(this);
    this.showTermsModal = this.showTermsModal.bind(this);
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
          this.props.firebase.displayNameUpdate(this.state.displayName)
          .then(() => {
            this.setState({feedback: "Success!", sending: false});
          })
          .catch(error => {
            this.setState({feedback: "Error setting display name: " + error.message, sending: false});
          });
        })
        .catch(error => {
          this.setState({feedback: error.message, sending: false});
        });
    }
    this.setState({validated: true});
  }
  
  showPrivacyModal() {
    this.setState({modalTitle: privacyTitle, modalBody: privacyBody, showModal: true});
  }
  
  showTermsModal() {
    this.setState({modalTitle: termsTitle, modalBody: termsBody, showModal: true});
  }
  
  render() {
    return (
      <Form noValidate onSubmit={this.handleSubmit} validated={this.state.validated}>
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
        <Form.Group>
          <Form.Label>Enter Display Name</Form.Label>
          <Form.Control required value={this.state.displayName} onChange={event => this.onFormChange(event, "displayName")} placeholder="Enter display name" maxLength={25} />
          <Form.Control.Feedback type="invalid">Please enter a display name</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Check required type="checkbox" label="By checking this box you agree to our Terms of Service and Privacy Policy" />
          <div className="mt-1">
            Read our <Button variant="link" className="border-0 p-0 align-baseline" onClick={this.showTermsModal}>Terms of Service</Button> and <Button variant="link" className="border-0 p-0 align-baseline" onClick={this.showPrivacyModal}>Privacy Policy</Button>
          </div>
        </Form.Group>
        {this.state.feedback && <p>{this.state.feedback}</p>}
        <Button variant="primary" type="submit" disabled={this.state.sending}>Create Account</Button>
        <DocumentModal showModal={this.state.showModal} hideModal={() => this.setState({showModal: false})} modalTitle={this.state.modalTitle} modalBody={this.state.modalBody} />
      </Form>
    );
  }
}

const SignUpPage = withFirebase(withRouter(SignUpPageBase));

export default SignUpPage;