import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import ROUTES from './../ROUTES';
import moment from 'moment';

class CommentBox extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isEditing: false, editText: props.comment.text, saveEditDisabled: false, deleteDisabled: false, isReporting: false, reportReason: "", reportDisabled: false};
    this.saveEdit = this.saveEdit.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.reportComment = this.reportComment.bind(this);
  }
  
  saveEdit() {
    this.setState({saveEditDisabled: true});
    this.props.onEdit(this.state.editText, this.props.comment.id)
    .then(() => {
      this.setState({saveEditDisabled: false, isEditing: false});
    });
  }
  
  deleteComment() {
    this.props.onDelete(this.props.comment.id);
    this.setState({deleteDisabled: true});
  }
  
  reportComment() {
    this.props.onReport(this.props.comment.id, this.props.comment.text, this.state.reportReason);
    this.setState({isReporting: false, reportDisabled: true});
  }
  
  render() {
    return (
      <Card className="commentCard my-2">
        <Card.Body>
          <Card.Title className="d-flex mb-0">
            <Link to={ROUTES.userformat + "/" + this.props.comment.author} data-toggle="tooltip" title="View this user's formats" onClick={event=> window.scrollTo(0, 0)}>{this.props.comment.authorName}</Link>
            {!this.props.isOwner && !this.state.isReporting && <Button variant="danger" className="ml-auto topRight" onClick={event => this.setState({isReporting: true})} disabled={this.state.reportDisabled}>Report Comment</Button>}
            {!this.props.isOwner && this.state.isReporting && <Button variant="danger" className="ml-auto topRight" onClick={this.reportComment}>Send Report</Button>}
            {this.props.isOwner && !this.state.isEditing && <ButtonGroup className="ml-auto topRight">
              <Button variant="info" className="flexShare" onClick={event => this.setState({isEditing: true})}>Edit</Button>
              <Button variant="danger" className="flexShare" onClick={this.deleteComment} disabled={this.state.deleteDisabled}>Delete</Button>
            </ButtonGroup>}
            {this.state.isEditing && <Button variant="info" className="ml-auto topRight" disabled={this.state.saveEditDisabled} onClick={this.saveEdit}>Save Comment</Button>}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{moment(this.props.comment.date.toDate()).format("LLL")}{this.props.comment.edited ? "*" : ""}</Card.Subtitle>
          {!this.state.isEditing && <Card.Text>{this.props.comment.text}</Card.Text>}
          {this.state.isEditing && <FormGroup>
            <FormLabel>Edit Your Comment:</FormLabel>
            <FormControl placeholder="Enter Message" value={this.state.editText} onChange={event => this.setState({editText: event.target.value})} as="textarea" rows="3" maxLength={250} />
          </FormGroup>}
          {this.state.isReporting && <FormGroup>
            <FormLabel>Enter Reason For Report:</FormLabel>
            <FormControl placeholder="Enter Reason" value={this.state.reportReason} onChange={event => this.setState({reportReason: event.target.value})} as="textarea" rows="3" maxLength={250} />
          </FormGroup>}
        </Card.Body>
      </Card>
    );
  }
}

export default CommentBox;
