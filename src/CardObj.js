import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Work around because the number 0 was appearing for this button even when the button should not be shown
class ButtonNumber extends Component {
  render() {
    if (this.props.alwaysShow || (this.props.number && this.props.number !== 0)) {
      return <Button variant="info" className="my-1">{this.props.number ? this.props.number : 0}</Button>;
    }
    return null;
  }
}

class CardObj extends Component {
  
  constructor(props) {
    super(props);   
    this.viewCard = this.viewCard.bind(this);
    this.changePoints = this.changePoints.bind(this);
    this.state = {};
    if (!props.card.points) {
      this.props.card.points = 0;
    }
    if (props.card.mana_cost) {
      const manaCostImage = props.card.mana_cost
      .split(" // ")
      .map(manaCost => {
        const manaArr = manaCost.split("}");
        return manaArr.slice(0, manaArr.length - 1) // Need to get rid of empty value
        .map(str => str.substring(1))
        .map(str => str.replace("/", ""))
        .map((str, i) => <img className="mana-cost-simple" src={"https://gatherer.wizards.com/Handlers/Image.ashx?size=small&name=" + str + "&type=symbol"} alt={str} key={i} />)
      });
      if (manaCostImage.length > 1) {
        manaCostImage.splice(1, 0, [<div className="mx-1">{"//"}</div>]);
      }        
      this.state = {manaCostImage: manaCostImage.flat()};
    } else if (props.card.cmc === 0 && (props.card.card_type && !props.card.card.type_line.toLowerCase().includes("land"))) {
      this.state = {manaCostImage: [<img src={"https://gatherer.wizards.com/Handlers/Image.ashx?size=small&name=0&type=symbol"} alt="0" key={0} />]};
    }
  }
  
  viewCard() {
    if (this.props.card.gathererLink.startsWith("http://gatherer.wizards.com") || this.props.card.gathererLink.startsWith("https://gatherer.wizards.com")) {
      window.open(this.props.card.gathererLink, "_blank");
    } else {
      console.log("Invalid info link, potentially dangerous: " + this.props.card.gathererLink);
    }
  }
  
  changePoints(increment) {
    if (!this.props.card.points) { //Redundant if already 0, but oh well
      this.props.card.points = 0;
    }
    this.props.card.points += (increment ? 1 : -1);
    this.props.card.points = Math.max(0, this.props.card.points);
    this.props.card.points = Math.min(this.props.groupMaxPoints, this.props.card.points);
    this.forceUpdate();
  }
  
  render() {
    if (this.props.simpleView) {
      return (
        <div className="d-flex flex-column border m-2">
          <div className="d-flex">
            <div className="d-flex flex-grow-1 pointer" onClick={event => this.setState({showNormal: !this.state.showNormal})}>
              <div className="d-flex my-auto ml-2 mr-auto">
                {this.props.card.name}
              </div>
              {this.state.manaCostImage && <div className="d-flex my-auto mr-2 align-items-center">
                {this.state.manaCostImage}
              </div>}
            </div>
            {this.props.count && (
              <Button variant="secondary" className="cardCount" onClick={event => this.props.onIncrement && this.props.onIncrement(this.props.card)}>{this.props.count}</Button>
            )}
            {this.props.onRemove && (
              <Button variant="danger" className="cardRemove" onClick={event => this.props.onRemove(this.props.card)}><b>-1</b></Button>
            )}        
            {this.props.onSide && (
              <Button variant="primary" className="sideboard" onClick={event => this.props.onSide(this.props.card)}><b>S</b></Button>
            )}
            {this.props.onMain && (
              <Button variant="primary" className="sideboard" onClick={event => this.props.onMain(this.props.card)}><b>M</b></Button>
            )}
          </div>
          {this.state.showNormal && (<div className="normal-image-container pointer" onClick={event => this.setState({showNormal: !this.state.showNormal})}>
            <img alt="Normal Size" src={this.props.card.normalImage} />
          </div>)}
          {this.state.showNormal && (<ButtonGroup>
            <Button variant="info" className="flexShare" onClick={this.viewCard}>View on Gatherer</Button>
            <Button className="flexShare">Purchase on TCGPlayer</Button>
          </ButtonGroup>)}
        </div>
      );
    }
    
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
        {this.props.usePointSystem && (<div className="pointSection">
          <div className="d-flex flex-column justify-content-center" data-toggle="tooltip" title={this.props.editPoints ? "Adjust point value for this card" : "Point value for this card"}>
            {this.props.editPoints && <Button variant="primary" onClick={event => this.changePoints(true)}>+</Button>}
            <ButtonNumber alwaysShow={this.props.editPoints} number={this.props.card.points} />
            {this.props.editPoints && <Button variant="primary" onClick={event => this.changePoints(false)}>-</Button>}
          </div>
        </div>)}
      </div>
    );
  }
}

export default CardObj;