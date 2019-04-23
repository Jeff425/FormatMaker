import React, { Component } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CardObj from './../CardObj';
import TitledDivider from './TitledDivider';

function CardSection(props) {
  if (!props.cards || props.cards.length < 1) {
    return null;
  }
  return (
    <div className="viewport fullWidth mt-3">
      <TitledDivider title={props.title} />
      <div className="centerAlign">
        {props.cards.map(card => {
          return <CardObj card={card} key={card.id} count={props.deckAmount[card.id]} onRemove={props.decrementCard} />
        })}
      </div>
    </div>
  );
}

class DeckManager extends Component {
  
  constructor(props) {
    super(props);
    this.typeCount = this.typeCount.bind(this);
  }
  
  typeCount(typeString) {
    if (!this.props.deckAmount) {
      return 0;
    }
    let endValue = 0;
    this.props.deck.filter(card => card.type_line.toLowerCase().includes(typeString.toLowerCase())).forEach(card => endValue += this.props.deckAmount[card.id]);
    return endValue;
  }
  
  render() {
    const banned = [];
    const warningTotalGroups = [];
    const warningCopies = [];
    if (this.props.deck) {
      for (let i = 0; i < this.props.groups.length; i++) {
        warningTotalGroups.push({count: 0, cards: []});
      }
      this.props.deck.forEach(card => {
        if (!(card.id in this.props.formatIds)) {
          return;
        }
        warningTotalGroups[this.props.formatIds[card.id].groupIndex].count += this.props.deckAmount[card.id];
      });
      this.props.deck.forEach(card => {        
        if (!(card.id in this.props.formatIds)) {
          banned.push(card);
          return;
        }
        const groupIndex = this.props.formatIds[card.id].groupIndex;
        if (this.props.groups[groupIndex].maxCopies > 0 && this.props.deckAmount[card.id] > this.props.groups[groupIndex].maxCopies) {
          warningCopies.push(card);
        }
        if (this.props.groups[groupIndex].maxTotal > 0 && warningTotalGroups[groupIndex].count > this.props.groups[groupIndex].maxTotal) {
          warningTotalGroups[groupIndex].cards.push(card);
        }
      });
    }
    let deckCount = 0;
    if (this.props.deckAmount) {
      Object.values(this.props.deckAmount).forEach(value => deckCount += value);
    }
    const landCount = this.typeCount("land");
    const creatureCount = this.typeCount("creature");
    const instantSorceryCount = this.typeCount("instant") + this.typeCount("sorcery");
    const otherCount = deckCount - landCount - creatureCount - instantSorceryCount;
    if (this.props.deck && this.props.deck.length > 0) {
      return (
        <div className="AppContainer">
          <input type="file" ref="deckLoader" className="hidden" onChange={this.props.onLoad} accept=".deck" />
          <h1>Deck Manager</h1>
          <ButtonGroup className="fullWidth mt-4">
            <Button variant="primary" onClick={this.props.onSave}>Export Deck</Button>
            <Button variant="primary" onClick={() => this.refs.deckLoader.click()}>Import Deck</Button>
          </ButtonGroup>
          <Container fluid className="bottomExtension">
            <Row>
              <Col>{"Total Cards: " + deckCount}</Col>
              <Col>{"Lands: " + landCount}</Col>
              <Col>{"Non-Lands: " + (deckCount - landCount)}</Col>
            </Row>
            <Row>
              <Col>{"Creatures: " + creatureCount}</Col>
              <Col>{"Instants and Sorceries: " + instantSorceryCount}</Col>
              <Col>{"Other Cards: " + otherCount}</Col>
            </Row>
          </Container>
          <div className="centerAlign">
            {this.props.deck && this.props.deck.map(card => {
              return <CardObj card={card} key={card.id} count={this.props.deckAmount[card.id]} onIncrement={this.props.incrementCard} onRemove={this.props.decrementCard} />;
            })}
          </div>
          <CardSection deckAmount={this.props.deckAmount} decrementCard={this.props.decrementCard} title="Banned (Please remove all cards)" cards={banned} />
          <CardSection deckAmount={this.props.deckAmount} decrementCard={this.props.decrementCard} title="Too many copies (Please lower card counts)" cards={warningCopies} />
          {warningTotalGroups.map((group, index) => {
            const title = "\"" + this.props.groups[index].groupName + "\" has too many cards (Please remove " + (group.count - this.props.groups[index].maxTotal) + " cards)";
            return <CardSection deckAmount={this.props.deckAmount} decrementCard={this.props.decrementCard} title={title} cards={group.cards} key={index} />
          })}
        </div>
      );
    }
    return (
      <div className="AppContainer">
        <input type="file" ref="deckLoader" className="hidden" onChange={this.props.onLoad} accept=".deck" />
        <h1>Deck Manager</h1>
        <Button className="fullWidth mt-4" variant="primary" onClick={() => this.refs.deckLoader.click()}>Import Deck</Button>
        <div className="mt-4">
          <h3>Import a deck or add cards to begin</h3>
        </div>
      </div>
    );
  }
}

export default DeckManager;