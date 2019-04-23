import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

class GroupEditor extends Component {
  
  constructor(props) {
    super(props);
    this.state = {groupName: (props.groupName ? props.groupName : ""), maxTotal: (props.maxTotal ? props.maxTotal : 0), maxCopies: (props.maxCopies ? props.maxCopies : 4), validated: false};
    this.handleChange = this.handleChange.bind(this);
    this.submitGroup = this.submitGroup.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
  }
  
  handleChange(event, name) {
    this.setState({[name]: event.target.value});
    if (name === "groupName" && this.props.checkName) {
      if (event.target.value && this.props.checkName(event.target.value)) {
        event.target.setCustomValidity("");
      } else {
        event.target.setCustomValidity("Group name already exists");
      }
    }
  }
  
  submitGroup() {
    if (!this.props.onSubmitGroup) {
      return;
    }   
    if (this.refs.groupForm.checkValidity() === false) {
      this.setState({validated: true});
      return;
    }
    this.props.onSubmitGroup(this.state.groupName, this.state.maxTotal, this.state.maxCopies);
    this.setState({validated: false});
    if (!this.props.groupName) {
      this.setState({groupName: "", maxTotal: 0, maxCopies: 4});
    }
  }
  
  deleteGroup() {
    if (!this.props.onDeleteGroup) {
      return;
    }
    this.props.onDeleteGroup(this.state.groupName);
  }
  
  render() {
    return (
      <Form className="bottomExtension" ref="groupForm" validated={this.state.validated}>
        <Form.Group>
          <Form.Label>Group Name</Form.Label>
          <Form.Control placeholder="Custom Group" required value={this.state.groupName} onChange={event => this.handleChange(event, "groupName")} disabled={this.props.groupName} />
          <Form.Control.Feedback type="invalid">{this.state.groupName ? "Please enter a unique name" : "Please enter a group name"}</Form.Control.Feedback>
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label className="mb-0">Maximum number of cards allowed in this group <p className="text-muted">(0 for unlimited)</p></Form.Label>
            <Form.Control required type="number" min="0" value={this.state.maxTotal} onChange={event => this.handleChange(event, "maxTotal")} />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label className="mb-0">Maximum copies of each card <p className="text-muted">(0 for unlimited)</p></Form.Label>
            <Form.Control required type="number" min="0" value={this.state.maxCopies} onChange={event => this.handleChange(event, "maxCopies")} />
          </Form.Group>
        </Form.Row>
        {this.props.groupName && (
          <ButtonGroup className="fullWidth">
            <Button variant="primary" className="flexShare" onClick={this.submitGroup}>Save Group</Button>
            <Button variant="danger" className="flexShare" onClick={this.deleteGroup}>Delete Group</Button>
          </ButtonGroup>
        )}
        {!this.props.groupName && (
          <Button variant="primary" className="fullWidth" onClick={this.submitGroup}>Create Group</Button>
        )}
      </Form>
    );
  }
}

export default GroupEditor;