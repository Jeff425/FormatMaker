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
          return <CardObj card={card} key={card.name} count={props.deckAmount[card.name]} onRemove={props.decrementCard} onIncrement={props.incrementCard} onMain={props.onMain} subtract={props.subtract} />
        })}
      </div>
    </div>
  );
}

class DeckManager extends Component {
  
  constructor(props) {
    super(props);
    this.typeCount = this.typeCount.bind(this);
    this.sumObjects = this.sumObjects.bind(this);
    this.decrementSideThenDeck = this.decrementSideThenDeck.bind(this);
    this.deckLoadRef = null;
    this.deckSelectionRef = null;
  }
  
  typeCount(typeString) {
    if (!this.props.deckAmount) {
      return 0;
    }
    let endValue = 0;
    this.props.deck
      .filter(card => card.type_line.toLowerCase()
        .includes(typeString.toLowerCase()))
      .forEach(card => endValue += this.props.deckAmount[card.name]);
    return endValue;
  }
  
  decrementSideThenDeck(card) {
    this.props.decrementCard(card, !!this.props.sideAmount[card.name]);
  }
  
  sumObjects(obj1, obj2) {
    const sum = {};
    Object.entries(obj1).concat(Object.entries(obj2)).forEach(entry => {
      if (sum[entry[0]]) {
        sum[entry[0]] += entry[1];
      } else {
        sum[entry[0]] = entry[1];
      }
    });
    return sum;
  }
  
  render() {
    const banned = [];
    const warningTotalGroups = [];
    const warningCopies = [];
    let notLegal = false;
    const seen = new Set();
    const combined = this.props.deck.concat(this.props.side).filter(card => {
      if (!seen.has(card.name)) {
        seen.add(card.name);
        return true;
      }
      return false;
    });  
    const combinedAmount = this.sumObjects(this.props.deckAmount, this.props.sideAmount);
    if (combined) {
      for (let i = 0; i < this.props.groups.length; i++) {
        warningTotalGroups.push({count: 0, cards: []});
      }
      combined.forEach(card => {
        if (!(card.name in this.props.formatIds)) {
          return;
        }
        warningTotalGroups[this.props.formatIds[card.name].groupIndex].count += combinedAmount[card.name];
      });
      combined.forEach(card => {        
        if (!(card.name in this.props.formatIds)) {
          banned.push(card);
          return;
        }
        const groupIndex = this.props.formatIds[card.name].groupIndex;
        if (this.props.groups[groupIndex].maxCopies > 0 && combinedAmount[card.name] > this.props.groups[groupIndex].maxCopies) {
          warningCopies.push(card);
        }
        if (this.props.groups[groupIndex].maxTotal > 0 && warningTotalGroups[groupIndex].count > this.props.groups[groupIndex].maxTotal) {
          notLegal = true;
          warningTotalGroups[groupIndex].cards.push(card);
        }
      });
    }
    let deckCount = 0;
    if (this.props.deckAmount) {
      Object.values(this.props.deckAmount).forEach(value => deckCount += value);
    }
    let sideCount = 0;
    if (this.props.sideAmount) {
      Object.values(this.props.sideAmount).forEach(value => sideCount += value);
    }
    const landCount = this.typeCount("land");
    const creatureCount = this.typeCount("creature");
    const instantSorceryCount = this.typeCount("instant") + this.typeCount("sorcery");
    const otherCount = deckCount - landCount - creatureCount - instantSorceryCount;
    notLegal = notLegal || banned.length > 0 || warningCopies.length > 0;
    
    let deckSizeError = "";
    if (this.props.deckMin > 0 && deckCount < this.props.deckMin) {
      deckSizeError = " (" + this.props.deckMin + " minimum)";
    } else if (this.props.deckMax > 0 && deckCount > this.props.deckMax) {
      deckSizeError = " (" + this.props.deckMax + " maximum)";
    }
    
    let sideboardError = "";
    if (this.props.sideMin > 0 && sideCount < this.props.sideMin) {
      sideboardError = " " + this.props.sideMin + " minimum";
    } else if (this.props.sideMax > 0 && sideCount > this.props.sideMax) {
      sideboardError = " " + this.props.sideMax + " maximum";
    }
    
    if (this.props.deck && (this.props.deck.length > 0 || this.props.side.length > 0)) {
      return (
        <div className="AppContainer">
          <input type="file" ref={ref => this.deckLoadRef = ref} className="hidden" onChange={this.props.onLoad} accept=".deck" />
          <h1>Deck Manager</h1>
          <ButtonGroup className="fullWidth mt-4">
            <Button variant="primary" onClick={this.props.onSave}>Export Deck</Button>
            <Button variant="primary" onClick={() => this.deckLoadRef.click()}>Import Deck</Button>
          </ButtonGroup>
          {notLegal && <Button variant="danger" className="fullWidth" onClick={() => window.scrollTo(0, this.deckSelectionRef.offsetTop + this.deckSelectionRef.offsetHeight)}>Fix Deck Issues</Button>}
          <Button variant="secondary" className="fullWidth" onClick={this.props.onPurchase}>Purchase on TCGPlayer</Button>
          <Container fluid className="bottomExtension">
            <Row>
              <Col className={deckSizeError ? "text-danger" : ""}>{"Total Cards: " + deckCount + deckSizeError}</Col>
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
              return <CardObj card={card} key={card.name} count={this.props.deckAmount[card.name]} onIncrement={this.props.incrementCard} onSelect={this.props.incrementCard} onRemove={this.props.decrementCard} onSide={this.props.sideboardAllowed ? card => {this.props.decrementCard(card); this.props.incrementCard(card, true)} : null} subtract={true} />;
            })}
          </div>
          <CardSection deckAmount={this.props.sideAmount} decrementCard={card => this.props.decrementCard(card, true)} incrementCard={card => this.props.incrementCard(card, true)} onSelect={card => this.props.incrementCard(card, true)} title={"Sideboard (" + sideCount +  ")" + sideboardError} cards={this.props.side} onMain={card => {this.props.decrementCard(card, true); this.props.incrementCard(card)}} subtract={true} />
          <div ref={ref => this.deckSelectionRef = ref} />
          <CardSection deckAmount={combinedAmount} decrementCard={this.decrementSideThenDeck} title="Banned (Please remove all cards)" cards={banned} subtract={true} />
          <CardSection deckAmount={combinedAmount} decrementCard={this.decrementSideThenDeck} title="Too many copies (Please lower card counts)" cards={warningCopies} subtract={true} />
          {warningTotalGroups.map((group, index) => {
            const title = "\"" + this.props.groups[index].groupName + "\" has too many cards (Please remove " + (group.count - this.props.groups[index].maxTotal) + " cards)";
            return <CardSection deckAmount={combinedAmount} decrementCard={this.decrementSideThenDeck} title={title} cards={group.cards} key={index} subtract={true} />
          })}
        </div>
      );
    }
    return (
      <div className="AppContainer">
        <input type="file" ref={ref => this.deckLoadRef = ref} className="hidden" onChange={this.props.onLoad} accept=".deck" />
        <h1>Deck Manager</h1>
        <Button className="fullWidth mt-4" variant="primary" onClick={() => this.deckLoadRef.click()}>Import Deck</Button>
        <div className="mt-4">
          <h3>Import a deck or add cards to begin</h3>
        </div>
      </div>
    );
  }
}

export default DeckManager;