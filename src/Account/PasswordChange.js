import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class PasswordChange extends Component {
  
  constructor(props) {
    super(props);
    this.state = {pwd: "", pwd2: "", feedback: "", sending: false, validated: false, isLoading: true}
    this.onFormChange = this.onFormChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        this.setState({authUser: auth, isLoading: false});
      } else {
        this.props.history.push(ROUTES.signin + ROUTES.passwordchange);
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
      this.props.firebase.passwordUpdate(this.state.pwd)
      .then(() =>{
        this.setState({sending: false, feedback: "Updated Password!"});
      })
      .catch(error => {
        this.setState({sending: false, feedback: "Error updating password " + error.code});
      });
    }
    this.setState({validated: true});
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
        <h1>Password Change</h1>
        <Form noValidate className="singleApp mt-3" onSubmit={this.handleSubmit} validated={this.state.validated}>
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control required type="password" placeholder="Enter password" onChange={event => this.onFormChange(event, "pwd")} value={this.state.pwd} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Re-enter Password</Form.Label>
            <Form.Control required type="password" placeholder="Confirm password" onChange={event => this.onFormChange(event, "pwd2")} value={this.state.pwd2} />
          </Form.Group>
          {this.state.feedback && <p>{this.state.feedback}</p>}
          <Button variant="primary" type="submit" disabled={this.state.sending || this.state.pwd === "" || this.state.pwd !== this.state.pwd2}>Update Password</Button>
        </Form>
      </div>
    );
  }
}

export default withRouter(withFirebase(PasswordChange));