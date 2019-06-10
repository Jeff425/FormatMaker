import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class UpdateDisplayName extends Component {
  
  constructor(props) {
    super(props);
    this.state = {oldName: "", displayName: "", validated: false, sending: false, feedback: ""};
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  componentDidMount() {
    this.props.firebase.getUserInfo(this.props.firebase.auth.currentUser.uid)
    .then(userInfo => {
      this.setState({oldName: userInfo.displayName});
    });
  }
  
  handleSubmit(event) {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      this.setState({sending: true});
      const oldName = this.state.displayName;
      this.props.firebase.displayNameUpdate(oldName)
      .then(() => {
        this.setState({feedback: "Success!", sending: false, oldName: oldName});
      })
      .catch(error => {
        this.setState({feedback: error.message, sending: false});
      });
    }
    this.setState({validated: true});
  }
  
  render() {
    return (
      <Form noValidate onSubmit={this.handleSubmit} validated={this.state.validated}>
        <Form.Group>
          <Form.Label>Set Display Name {this.state.oldName && <span className="text-muted">{this.state.oldName}</span>}</Form.Label>
          <Form.Control required value={this.state.displayName} onChange={event => this.setState({displayName: event.target.value})} placeholder="Enter Display Name" />
          <Form.Control.Feedback type="invalid">Please enter a display name</Form.Control.Feedback>
        </Form.Group>
        {this.state.feedback && <p>{this.state.feedback}</p>}
        <Button variant="primary" type="submit" disabled={this.state.sending}>Apply Name Change</Button>
      </Form>
    );
  }
}

class UpdatePassword extends Component {
  
  constructor(props) {
    super(props);
    this.state = {pwd: "", pwd2: "", currentPwd: "", sending: false, validated: false, feedback: ""};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
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
        .passwordUpdate(this.state.pwd, this.state.currentPwd)
        .then(() => {
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
      <Form noValidate onSubmit={this.handleSubmit} validated={this.state.validated}>
        <Form.Group>
          <Form.Label>Current Password</Form.Label>
          <Form.Control required type="password" value={this.state.currentPwd} onChange={event => this.onFormChange(event, "currentPwd")} placeholder="Enter current password"/>
          <Form.Control.Feedback type="invalid">Please enter current password</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label>Update Password</Form.Label>
          <Form.Control required type="password" value={this.state.pwd} onChange={event => this.onFormChange(event, "pwd")} placeholder="Enter password" />
          <Form.Control.Feedback type="invalid">Please enter a password</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control required type="password" value={this.state.pwd2} onChange={event => this.onFormChange(event, "pwd2")} placeholder="Enter password again" ref="pwd2" />
          <Form.Control.Feedback type="invalid">{this.state.mismatch ? "Please enter the same password" : "Please enter a password"}</Form.Control.Feedback>
        </Form.Group>
        {this.state.feedback && <p>{this.state.feedback}</p>}
        <Button variant="primary" type="submit" disabled={this.state.sending}>Apply Password Change</Button>
      </Form>
    );
  }
}

class AccountInfo extends Component {
  
  constructor(props) {
    super(props);
    this.state = {authUser: null};
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.accountinfo);
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (!auth.emailVerified) {
          this.props.history.push(ROUTES.emailverify);
          return;
        }
        this.setState({authUser: auth});
        
      } else {
        this.props.history.push(ROUTES.signin + ROUTES.format + encodeURIComponent("/") + (this.props.match.params.formatId ? encodeURIComponent(this.props.match.params.formatId) : ""));
        ReactGA.event({category: "Redirection", action: "AccountInfo to sign in page"});
      }
    });
  }
  
  componentWillUnmount() {
    this.listener();
  }
  
  render() {
    if (!this.state.authUser) {
      return (
        <div className="main-page">
          <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
        </div>
      );
    }
    
    return (
      <div className="main-page">
        <div className="singleApp">
          <h1>Account Information</h1>
          <UpdateDisplayName firebase={this.props.firebase} />
          <hr />
          <UpdatePassword firebase={this.props.firebase} />
        </div>
      </div>
    );
  }
}

export default withFirebase(AccountInfo);