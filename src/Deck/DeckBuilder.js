import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { saveAs } from 'file-saver';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import FormCheck from 'react-bootstrap/FormCheck';
import CardSelection from './CardSelection';
import DeckManager from './DeckManager';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class DeckBuilder extends Component {
  
  constructor(props) {
    super(props);
    this.state = {commanderFormat: false, hasUpdatedCards: false, groups: [], currentTab: "legal", formatIds: {}, sortingFunc: null, deckSelection: [], deckAmount: {}, sideSelection: [], sideAmount: {}, commanderSelection: new Set(), name: "", desc: "", deckMin: 0, deckMax: 0, sideboardAllowed: false, sideMin: 0, sideMax: 0, showSave: false, fileName: "customDeck", fileType: 0};
    this.sort = this.sort.bind(this);
    this.addCommander = this.addCommander.bind(this);
    this.removeCommander = this.removeCommander.bind(this);
    this.addCard = this.addCard.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.saveDeckFile = this.saveDeckFile.bind(this);
    this.saveDeck = this.saveDeck.bind(this);
    this.loadDeck = this.loadDeck.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.successRead = this.successRead.bind(this);
    this.errorRead = this.errorRead.bind(this);
    this.purchaseDeck = this.purchaseDeck.bind(this);
    this.deckString = this.deckString.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.deck + "/" + this.props.match.params.formatId);
    this.props.firebase.readFormat(this.props.match.params.formatId, this.successRead, this.errorRead);
  }
  
  successRead(name, desc, longDesc, hasUpdatedCards, commanderFormat, formatText) {
    const formatIds = {};
    const format = JSON.parse(formatText);
    for (let i = 0; i < format.groups.length; i++) {
      format.groups[i].cards.forEach(card => {
        formatIds[card.name] = {groupIndex: i, card: card}
      });
    }
    format.deckMin = format.deckMin ? format.deckMin : 0;
    format.deckMax = format.deckMax ? format.deckMax : 0;
    format.sideMin = format.sideMin ? format.sideMin : 0;
    format.sideMax = format.sideMax ? format.sideMax : 0;
    const sideboardAllowed = format.sideboardAllowed || format.sideboardAllowed !== false;
    this.setState({commanderFormat: !!commanderFormat, hasUpdatedCards: !!hasUpdatedCards, formatIds: formatIds, currentTab: format.groups.length > 0 ? "extra_" + format.groups[0].groupName : "", name: name, desc: desc, deckMin: format.deckMin, deckMax: format.deckMax, sideboardAllowed: sideboardAllowed, sideMin: format.sideMin, sideMax: format.sideMax, fileType: !!commanderFormat ? 1 : 0});
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
  
  // Should add to deck if it isn't already in deck for restriction calculations
  // Should ONLY be displayed under commander section and error groups. Not in main deck.
  // Cannot be a sideboard card
  addCommander(card) {
    if (!this.state.commanderFormat) {
      return;
    }
    this.setState({commanderSelection: this.state.commanderSelection.add(card.name)});
  }
  
  removeCommander(card) {
    const newCommanders = new Set(this.state.commanderSelection);
    newCommanders.delete(card.name);
    this.setState({commanderSelection: newCommanders});
  }
  
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
      this.setState({sideSelection: this.cmcSort(newDeck), sideAmount: newDeckAmount});
    } else {
      this.setState({deckSelection: this.cmcSort(newDeck), deckAmount: newDeckAmount});
    }
  }
  
  //Used only when adding a card
  cmcSort(cards) {
    return cards.sort((a, b) => {
      return a.cmc - b.cmc;
    });
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
  
  urlDeckString() {
    let saveString = "";
    this.state.deckSelection.forEach(card => {
      saveString += this.state.deckAmount[card.name] + " " + (card.searchName ? card.searchName : card.name) + "||";
    });
    if (this.state.sideSelection.length > 0) {
      this.state.sideSelection.forEach(card => {
        saveString += this.state.sideAmount[card.name] + " " + (card.searchName ? card.searchName : card.name) + "||";
      });
    }
    return saveString.substring(0, saveString.length - 2);
  }
  
  deckString() {
    let saveString = "";
    this.state.deckSelection.forEach(card => {
      saveString += this.state.deckAmount[card.name] + " " + card.name + "\n";
    });
    if (this.state.sideSelection.length > 0) {
      saveString += "//Sideboard\n";
      this.state.sideSelection.forEach(card => {
        saveString += this.state.sideAmount[card.name] + " " + card.name + "\n";
      });
    }
    if (this.state.commanderSelection.size > 0) {
      saveString += "//Commander\n";
      this.state.commanderSelection.forEach(cardName => {
        if (this.state.deckAmount[cardName]) {
          saveString += "1 " + cardName + "\n";
        }
      });
    }
    return saveString.substring(0, saveString.length - 1);
  }
  
  cockatriceDeckString() {
    let saveString = "";
    this.state.deckSelection.forEach(card => {
      saveString += this.state.deckAmount[card.name] + " " + card.name + "\n";
    });
    this.state.sideSelection.forEach(card => {
      saveString += "SB: " + this.state.sideAmount[card.name] + " " + card.name + "\n";
    });
    this.state.commanderSelection.forEach(cardName => {
      saveString += "CM: 1 " + cardName + "\n";
    });
    return saveString.substring(0, saveString.length - 1);
  }
  
  // Actually Saves the file
  saveDeckFile() {
    if (!this.state.fileName) {
      return;
    }
    const saveString = this.state.fileType === 0 ? this.cockatriceDeckString() : this.deckString();
    const blob = new Blob([saveString], {type: "plain/text"});
    saveAs(blob, this.state.fileName + (this.state.fileType === 0 ? ".txt" : ".deck"));
    this.setState({showSave: false});
  }
  
  // Shows modal
  saveDeck() {
    this.setState({showSave: true});
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
      const commanderSelection = new Set();
      let isSideboard = false;
      let isCommander = false;
      reader.result.replace(/\r/g, '').split("\n").forEach(line => {      
        if (!isSideboard && line === "//Sideboard") {
          isSideboard = true;
          return;
        }
        if (!isCommander && line === "//Commander") {
          isCommander = true;
          return;
        }
        let tempSideboard = false;
        let startIndex = 0;
        let tempCommander = false;
        if (line.substr(0, 4) === "SB: ") {
          tempSideboard = true;
          startIndex = 4;
        }
        else if (line.substr(0, 4) === "CM: ") {
          tempCommander = true;
          startIndex = 4;
        }
        
        const count = parseInt(line.substr(startIndex, line.indexOf(" ")));
        if (isNaN(count)) {
          return;
        }
        const name = line.substr(line.indexOf(" ", startIndex) + 1);
        const cardDetails = this.state.formatIds[name];
        if (cardDetails) {
          const card = cardDetails.card;
          if (isCommander || tempCommander) {
            commanderSelection.add(card.name);
          }
          else if (isSideboard || tempSideboard) {
            sideSelection.push(card);
            sideAmount[card.name] = count;
          } else {
            selection.push(card);
            amount[card.name] = count;
          }
        }
      });
      this.setState({deckSelection: this.cmcSort(selection), deckAmount: amount, sideSelection: this.cmcSort(sideSelection), sideAmount: sideAmount, commanderSelection: commanderSelection});
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
    ReactGA.event({category: "Affiliate Link", action: "TCGPlayer", label: this.props.match.params.formatId});
    window.open("https://store.tcgplayer.com/massentry?partner=FormatMaker&utm_campaign=affiliate&utm_medium=FormatMaker&utm_source=FormatMaker&c=" + this.urlDeckString(), "_blank");
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
                formatName={this.state.name}
                formatDesc={this.state.desc}
                deckMin={this.state.deckMin}
                deckMax={this.state.deckMax}
                sideboardAllowed={this.state.sideboardAllowed}
                sideMin={this.state.sideMin}
                sideMax={this.state.sideMax}
                commanderFormat={this.state.commanderFormat}
                deckAmount={this.state.deckAmount}
                sideAmount={this.state.sideAmount}
                addCommander={this.addCommander}
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
                deckMin={this.state.deckMin}
                deckMax={this.state.deckMax}
                sideboardAllowed={this.state.sideboardAllowed}
                sideMin={this.state.sideMin}
                sideMax={this.state.sideMax}
                commanderSelection={this.state.commanderSelection}
                removeCommander={this.removeCommander}
              />
            </Col>
          </Row>
          
          <Modal show={this.state.showSave} onHide={event => this.setState({showSave: false})}>
            <Modal.Header closeButton>
              <Modal.Title>Save Format</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FormGroup>
                <FormLabel>File Name:</FormLabel>
                <FormControl placeholder="Enter File Name:"  value={this.state.fileName} onChange={event => this.setState({fileName: event.target.value})} />
              </FormGroup>
              <FormLabel>File Type:</FormLabel>
              <div>
                <FormCheck inline type="radio" label=".txt" checked={this.state.fileType === 0} onChange={event => event.target.checked && this.setState({fileType: 0})} data-toggle={this.state.commanderFormat ? "tooltip" : ""} title={this.state.commanderFormat ? "Saving in another program will overwrite commander selection" : ""} />
                <FormCheck inline type="radio" label=".deck" checked={this.state.fileType === 1} onChange={event => event.target.checked && this.setState({fileType: 1})} />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="success" onClick={this.saveDeckFile}>Save Format</Button>
            </Modal.Footer>
          </Modal>
        </Container>
      );
    }
    return (
      <div className="main-page">
        <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
      </div>
    );
  }
}

export default withFirebase(DeckBuilder);