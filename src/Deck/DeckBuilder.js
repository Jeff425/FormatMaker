import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { saveAs } from 'file-saver';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CardSelection from './CardSelection';
import DeckManager from './DeckManager';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class DeckBuilder extends Component {
  
  constructor(props) {
    super(props);
    this.state = {groups: [], currentTab: "legal", formatIds: {}, sortingFunc: null, deckSelection: [], deckAmount: {}, sideSelection: [], sideAmount: {}, name: "", desc: "", deckMin: 0, deckMax: 0, sideboardAllowed: false, sideMin: 0, sideMax: 0};
    this.sort = this.sort.bind(this);
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
    ReactGA.pageview(ROUTES.deck + "/" + this.props.match.params.formatId);
    this.props.firebase.readFormat(this.props.match.params.formatId, this.successRead, this.errorRead);
  }
  
  successRead(name, desc, longDesc, formatText) {
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
    this.setState({formatIds: formatIds, currentTab: format.groups.length > 0 ? "extra_" + format.groups[0].groupName : "", name: name, desc: desc, deckMin: format.deckMin, deckMax: format.deckMax, sideboardAllowed: sideboardAllowed, sideMin: format.sideMin, sideMax: format.sideMax});
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
      reader.result.replace(/\r/g, '').split("\n").forEach(line => {      
        if (!isSideboard && line === "//Sideboard") {
          isSideboard = true;
          return;
        }
        let tempSideboard = false;
        let startIndex = 0;
        if (line.substr(0, 4) === "SB: ") {
          tempSideboard = true;
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
          if (isSideboard || tempSideboard) {
            sideSelection.push(card);
            sideAmount[card.name] = count;
          } else {
            selection.push(card);
            amount[card.name] = count;
          }
        }
      });
      this.setState({deckSelection: selection, deckAmount: amount, sideSelection: sideSelection, sideAmount: sideAmount});
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
                formatName={this.state.name}
                formatDesc={this.state.desc}
                deckMin={this.state.deckMin}
                deckMax={this.state.deckMax}
                sideboardAllowed={this.state.sideboardAllowed}
                sideMin={this.state.sideMin}
                sideMax={this.state.sideMax}
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
  }
}

export default withFirebase(DeckBuilder);