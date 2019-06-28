import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ROUTES from './../ROUTES';

class DeckCard extends Component {
  render() {
    return (
      <Card className="formatCard ml-3 mr-3 mt-3">
        <Card.Body className="d-flex flex-column">
          <Card.Title>{this.props.deck.deckName}</Card.Title>
          <Card.Text>{this.props.deck.deckDesc}</Card.Text>
          <div className="d-flex justify-content-between mt-auto align-items-center">
            {this.props.removeDeck && <Card.Link as={Link} to={ROUTES.deck + "/" + this.props.formatId + "/" + this.props.deck.id} onClick={event=> window.scrollTo(0, 0)}>Edit Deck</Card.Link>}
            <Card.Link as={Link} to={ROUTES.deckdetails + "/" + this.props.formatId + "/" + this.props.deck.id} onClick={event=> window.scrollTo(0, 0)}>View Deck Info</Card.Link>
            {this.props.removeDeck && <Button variant="danger" className="ml-4" onClick={event => this.props.removeDeck(this.props.formatId, this.props.deck.id)}><FontAwesomeIcon icon="times" className="fa-w-16" /></Button>}
          </div>
        </Card.Body>
      </Card>
    );
  }
}

export default DeckCard;