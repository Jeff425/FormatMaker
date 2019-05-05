import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';

class PasswordForget extends Component {
  
  constructor(props) {
    super(props);
    this.state = {email: "", feedback: "", sending: false, validated: false}
    this.onFormChange = this.onFormChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        this.props.history.push("/");
      }
    });
  }
  
  componentWillUnmount() {
    this.listener();
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
      this.props.firebase.passwordReset(this.state.email)
      .then(() =>{
        this.setState({sending: false, feedback: "Sent password reset email!"});
      })
      .catch(error => {
        this.setState({sending: false, feedback: "Error sending password reset email: " + error.code});
      });
    }
    this.setState({validated: true});
  }
  
  render() {  
    return (
      <div className="main-page">
        <div className="singleApp">
        <h1>Password Reset</h1>
          <Form noValidate className="mt-3" onSubmit={this.handleSubmit} validated={this.state.validated}>
            <Form.Group>
              <Form.Label>Email address</Form.Label>
              <Form.Control required type="email" placeholder="Enter email" onChange={event => this.onFormChange(event, "email")} value={this.state.email} />
            </Form.Group>
            {this.state.feedback && <p>{this.state.feedback}</p>}
            <Button variant="primary" type="submit" disabled={this.state.sending || this.state.email === ""}>Send Email</Button>
          </Form>
        </div>
      </div>
    );
  }
}

export default withRouter(withFirebase(PasswordForget));