import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class CardObj extends Component {
  
  constructor(props) {
    super(props);   
    this.viewCard = this.viewCard.bind(this);
  }
  
  viewCard() {
    if (this.props.card.gathererLink.startsWith("http://gatherer.wizards.com") || this.props.card.gathererLink.startsWith("https://gatherer.wizards.com")) {
      window.open(this.props.card.gathererLink, "_blank");
    } else {
      console.log("Invalid info link, potentially dangerous: " + this.props.card.gathererLink);
    }
  }
  
  render() {
    return (
      <div className="cardContainer m-1">
        {this.props.onSelect && (
          <div className="cardForeground" onClick={() => this.props.onSelect(this.props.card)}><div className="foregroundText">{this.props.subtract ? "+1" : ""}</div></div>
        )}        
        <img src={this.props.card.imageUri} 
          alt={this.props.card.name} 
          key={this.props.card.id} />
        <Button variant="info" className="cardSearch" onClick={this.viewCard}><FontAwesomeIcon icon="search" className="fa-w-16" /></Button>
        {this.props.onRemove && (
          <Button variant="danger" className="cardRemove" onClick={event => this.props.onRemove(this.props.card)}>{(this.props.subtract && this.props.count && this.props.count > 1) ? <b>-1</b> : <FontAwesomeIcon icon="times" className="fa-w-16" />}</Button>
        )}
        {this.props.count && (
          <Button variant="secondary" className="cardCount" onClick={event => this.props.onIncrement && this.props.onIncrement(this.props.card)}>{this.props.count}</Button>
        )}
        {this.props.onSide && (
          <Button variant="primary" className="sideboard" onClick={event => this.props.onSide(this.props.card)}><b>S</b></Button>
        )}
        {this.props.onMain && (
          <Button variant="primary" className="sideboard" onClick={event => this.props.onMain(this.props.card)}><b>M</b></Button>
        )}
      </div>
    );
  }
}

export default CardObj;