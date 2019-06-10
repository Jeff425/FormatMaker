import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ROUTES from './../ROUTES';

class FormatCard extends Component {
  render() {
    return (
      <Card key={this.props.format.id} className="formatCard ml-3 mr-3 mt-3">
        <Card.Body className="d-flex flex-column">
          <Card.Title>{this.props.format.name}</Card.Title>
          {this.props.format.authorName && <Link to={ROUTES.userformat + "/" + this.props.format.author} data-toggle="tooltip" title="View this user's formats"><Card.Subtitle className="mb-2 text-muted">{this.props.format.authorName}</Card.Subtitle></Link>}
          <Card.Text>{this.props.format.description}</Card.Text>
          <div className="d-flex justify-content-between mt-auto align-items-center">
            {this.props.removeFormat && <Card.Link as={Link} to={ROUTES.format + "/" + this.props.format.id}>Edit Format</Card.Link>}
            {!this.props.removeFormat && <Card.Link as={Link} to={ROUTES.formatdetails + "/" + this.props.format.id}>View Format Info</Card.Link>}
            <Card.Link as={Link} to={ROUTES.deck + "/" + this.props.format.id}>Make Deck</Card.Link>     
            {this.props.removeFormat && <Button variant="danger" className="ml-4" onClick={event => this.props.removeFormat(this.props.format.id)}><FontAwesomeIcon icon="times" className="fa-w-16" /></Button>}
          </div>
        </Card.Body> 
      </Card>
    );
  }
}

export default FormatCard;