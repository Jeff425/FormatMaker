import React, { Component } from 'react';
import { saveAs } from 'file-saver';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CardSelection from './CardSelection';
import DeckManager from './DeckManager';
import { withFirebase } from './../Firebase/FirebaseContext';

class DeckBuilder extends Component {
  
  constructor(props) {
    super(props);
    this.state = {groups: [], currentTab: "legal", formatIds: {}, sortingFunc: null, deckSelection: [], deckAmount: {}, sideSelection: [], sideAmount: {}};
    this.sort = this.sort.bind(this);
    //this.loadFormat = this.loadFormat.bind(this);
    this.addCard = this.addCard.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.saveDeck = this.saveDeck.bind(this);
    this.loadDeck = this.loadDeck.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.successRead = this.successRead.bind(this);
    this.errorRead = this.errorRead.bind(this);
    this.purchaseDeck = this.purchaseDeck.bind(this);
    this.deckString = this.deckString.bind(this);
  }
  
  componentDidMount() {
    this.props.firebase.readFormat(this.props.match.params.formatId, this.successRead, this.errorRead);
  }
  
  successRead(name, desc, formatText) {
    const formatIds = {};
    const format = JSON.parse(formatText);
    for (let i = 0; i < format.groups.length; i++) {
      format.groups[i].cards.forEach(card => {
        formatIds[card.name] = {groupIndex: i, card: card}
      });
    }
    this.setState({formatIds: formatIds, currentTab: format.groups.length > 0 ? "extra_" + format.groups[0].groupName : ""});
    if (this.state.sortingFunc) {
      this.sort(this.state.sortingFunc, format.groups);
    } else {
      this.setState({groups: format.groups});
    }
  }
  
  errorRead(error) {
    console.log("Error with format " + this.props.match.params.formatId + " error was: " + error);
  }
  
  sort(sortingFunc, newGroups) {
    let groups;
    if (newGroups) {
      groups = newGroups;
    } else {
      groups = [...this.state.groups]
    }
    groups.forEach(group => {
      group.cards = sortingFunc(group.cards);
    });
    this.setState({sortingFunc: sortingFunc, groups: groups});
  }
  
  /*
  loadFormat(e) {
    if(!e.target.files[0]) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const formatIds = {};
      const format = JSON.parse(reader.result);
      for (let i = 0; i < format.groups.length; i++) {
        format.groups[i].cards.forEach(card => {
          formatIds[card.name] = {groupIndex: i, card: card}
        });
      }
      this.setState({formatIds: formatIds, currentTab: format.groups.length > 0 ? "extra_" + format.groups[0].groupName : ""});
      if (this.state.sortingFunc) {
        this.sort(this.state.sortingFunc, format.groups);
      } else {
        this.setState({groups: format.groups});
      }
    };
    reader.readAsText(e.target.files[0]);
  }
  */
  
  addCard(card, sideboard = false) {
    const deckSelection = sideboard ? this.state.sideSelection : this.state.deckSelection;
    const deckAmount = sideboard ? this.state.sideAmount : this.state.deckAmount;
    if(deckAmount[card.name]) {
      const newDeckAmount = {...deckAmount};
      newDeckAmount[card.name]++;
      if (sideboard) {
        this.setState({sideAmount : newDeckAmount});
      } else {
        this.setState({deckAmount: newDeckAmount});
      }
      return;
    }
    const newDeck = deckSelection.concat(card);
    const newDeckAmount = {...deckAmount};
    newDeckAmount[card.name] = 1;
    if (sideboard) {
      this.setState({sideSelection: newDeck, sideAmount: newDeckAmount});
    } else {
      this.setState({deckSelection: newDeck, deckAmount: newDeckAmount});
    }
  }
  
  removeCard(card, sideboard = false) {
    const deckSelection = sideboard ? this.state.sideSelection : this.state.deckSelection;
    const deckAmount = sideboard ? this.state.sideAmount : this.state.deckAmount;
    if(deckAmount[card.name] > 1) {
      const newDeckAmount = {...deckAmount};
      newDeckAmount[card.name]--;
      if (sideboard) {
        this.setState({sideAmount : newDeckAmount});
      } else {
        this.setState({deckAmount: newDeckAmount});
      }
      return;
    }
    const newDeck = deckSelection.filter(icard => icard !== card);
    const newDeckAmount = {...deckAmount};
    delete newDeckAmount[card.name];
    if (sideboard) {
      this.setState({sideSelection: newDeck, sideAmount: newDeckAmount});
    } else {
      this.setState({deckSelection: newDeck, deckAmount: newDeckAmount});
    }
  }
  
  deckString(url = false) {
    let saveString = "";
    this.state.deckSelection.forEach(card => {
      saveString += this.state.deckAmount[card.name] + " " + card.name + (url ? "||" : "\n");
    });
    if (this.state.sideSelection.length > 0) {
      if (!url) {
        saveString += "//Sideboard\n";
      }
      this.state.sideSelection.forEach(card => {
        saveString += this.state.sideAmount[card.name] + " " + card.name + (url ? "||" : "\n");
      });
    }
    return saveString.substring(0, saveString.length - (url ? 2 : 1));
  }
  
  saveDeck() {
    const saveString = this.deckString();
    const blob = new Blob([saveString], {type: "plain/text"});
    saveAs(blob, "customDeck" + Date.now() + ".deck");
    /*
    const deck = {selection: this.state.deckSelection, amount: this.state.deckAmount};
    const blob = new Blob([JSON.stringify(deck, null, 2)], {type: "application/json"});
    saveAs(blob, "customDeck" + Date.now() + ".deck");
    */
  }
  
  loadDeck(e) {
    if(!e.target.files[0]) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const selection = [];
      const amount = {};
      const sideSelection = [];
      const sideAmount = {};
      let isSideboard = false;
      reader.result.split("\n").forEach(line => {
        if (!isSideboard && line === "//Sideboard") {
          isSideboard = true;
          return;
        }
        const count = parseInt(line.substr(0, line.indexOf(" ")));
        if (isNaN(count)) {
          return;
        }
        const name = line.substr(line.indexOf(" ") + 1);
        const cardDetails = this.state.formatIds[name];
        if (cardDetails) {
          const card = cardDetails.card;
          if (isSideboard) {
            sideSelection.push(card);
            sideAmount[card.name] = count;
          } else {
            selection.push(card);
            amount[card.name] = count;
          }
        }
      });
      this.setState({deckSelection: selection, deckAmount: amount, sideSelection: sideSelection, sideAmount: sideAmount});
      /*
      const deck = JSON.parse(reader.result);
      this.setState({deckSelection: deck.selection, deckAmount: deck.amount});
      */
    };
    reader.readAsText(e.target.files[0]);
  }
  
  purchaseDeck() {
    /* Temporarily doing GET request. Once TCGPlayer helps with POST requests I can switch back.
    fetch("https://store.tcgplayer.com/massentry?partner=FormatMaker&utm_campaign=affiliate&utm_medium=FormatMaker&utm_source=FormatMaker", {
      method: "POST",
      headers: {
        "Accept": "text/html",
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: "c=" + "1%20Manalith"//this.deckString(true)
    })
    .then(console.log);
    */
    window.open("https://store.tcgplayer.com/massentry?partner=FormatMaker&utm_campaign=affiliate&utm_medium=FormatMaker&utm_source=FormatMaker&c=" + this.deckString(true), "_blank");
  }
  
  onTabChange(key) {
    this.setState({currentTab: key});
  }
  
  render() {
    if (this.state.groups.length > 0) {
      return (
        <Container fluid>
          <Row>
            <Col lg>
              <CardSelection 
                sortPass={this.sort} 
                addCard={this.addCard} 
                groups={this.state.groups}
                tabKey={this.state.currentTab}
                onTabChange={this.onTabChange}
              />
            </Col>
            <Col lg>
              <DeckManager 
                deck={this.state.deckSelection} 
                deckAmount={this.state.deckAmount}
                side={this.state.sideSelection}
                sideAmount={this.state.sideAmount}
                incrementCard={this.addCard} 
                decrementCard={this.removeCard} 
                onSave={this.saveDeck} 
                onLoad={this.loadDeck} 
                groups={this.state.groups}
                formatIds={this.state.formatIds}
                onPurchase={this.purchaseDeck}
              />
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <div className="main-page">
        <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
      </div>
    );
    /*
    return (
      <div className="main-page">
        <input type="file" ref="formatLoader" className="hidden" onChange={this.loadFormat} accept=".format" />
        <h1>Build a deck for a custom format</h1>
        <h4>To get started, please load a custom format file</h4>
        <div className="initialLoadFormat">
          <Button variant="primary" onClick={() => this.refs.formatLoader.click()}>Load Format</Button>
        </div>
      </div>
    );
    */
  }
}

export default withFirebase(DeckBuilder);