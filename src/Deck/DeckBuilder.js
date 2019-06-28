import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import FormCheck from 'react-bootstrap/FormCheck';
import Alert from 'react-bootstrap/Alert';
import { Link, withRouter } from 'react-router-dom';
import CardSelection from './CardSelection';
import DeckManager from './DeckManager';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import { saveDeckFile, purchaseDeck } from './DeckUtils';

class DeckBuilder extends Component {
  
  constructor(props) {
    super(props);
    this.state = {error: "", isLoading: false, deckName: "", deckDescription: "", showDeckInfo: false, accountState: 0, commanderFormat: false, hasUpdatedCards: false, groups: [], currentTab: "legal", formatIds: {}, sortingFunc: null, deckSelection: [], deckAmount: {}, sideSelection: [], sideAmount: {}, commanderSelection: new Set(), name: "", desc: "", deckMin: 0, deckMax: 0, sideboardAllowed: false, sideMin: 0, sideMax: 0, showSave: false, fileName: "customDeck", fileType: 0};
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
    this.publishDeck = this.publishDeck.bind(this);
    this.editInfo = this.editInfo.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.deck + "/" + this.props.match.params.formatId);
    this.props.firebase.readFormat(this.props.match.params.formatId, this.successRead, this.errorRead);
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (!auth.emailVerified) {
          this.setState({accountState: 1, isLoading: false});
          if (this.props.match.params.deckId) {
            this.props.history.push(ROUTES.deck + "/" + this.props.match.params.formatId);
          }
        } else {
          this.setState({accountState: 2});
          if (!this.props.match.params.deckId) {
            this.setState({isLoading: false});
          } else {
            this.readDeck();
          }
        }
      } else {
        this.setState({accountState: 0, isLoading: false});
        if (this.props.match.params.deckId) {
          this.props.history.push(ROUTES.deck + "/" + this.props.match.params.formatId);
        }
      }
    });
  }
  
  componentWillUnmount() {
    this.listener();
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
  
  // Actually Saves the file
  saveDeckFile() {
    saveDeckFile(this.state.fileName, this.state.fileType, this.state.deckSelection, this.state.deckAmount, this.state.sideSelection, this.state.sideAmount, this.state.commanderSelection);
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
    ReactGA.event({category: "Affiliate Link", action: "TCGPlayer", label: this.props.match.params.formatId});
    purchaseDeck(this.state.deckSelection, this.state.deckAmount, this.state.sideSelection, this.state.sideAmount);
  }
  
  onTabChange(key) {
    this.setState({currentTab: key});
  }
  
  publishDeck(makePublic = false) {
    if (!this.state.deckName || (!this.state.deckDescription && makePublic)) {
      this.editInfo();
      return;
    }
    this.setState({isLoading: true, error: ""});
    this.props.firebase.writeDeck(makePublic, this.state.deckName, this.state.deckDescription, JSON.stringify({deckSelection: this.state.deckSelection, sideSelection: this.state.sideSelection, deckAmount: this.state.deckAmount, sideAmount: this.state.sideAmount, commanderSelection: Array.from(this.state.commanderSelection)}), this.props.match.params.formatId, this.props.match.params.deckId)
    .then(deckId => {
      this.props.history.push(ROUTES.deck + "/" + this.props.match.params.formatId + "/" + deckId);
      this.setState({writeSucceed: true, isLoading: false});
    })
    .catch(errorMsg => {
      this.setState({isLoading: false, error: errorMsg});
    });
  }
  
  readDeck() {
    if (!this.props.match.params.formatId || !this.props.match.params.deckId) {
      return;
    }
    this.setState({isLoading: true, error: ""});
    this.props.firebase.readDeck(this.props.match.params.formatId, this.props.match.params.deckId, true)
    .then(deckData => {
      const deckName = deckData.deckName;
      const deckDescription = deckData.deckDescription;
      const deck = JSON.parse(deckData.deckText);
      this.setState({isLoading: false, deckName: deckName, deckDescription: deckDescription, deckSelection: deck.deckSelection, sideSelection: deck.sideSelection, deckAmount: deck.deckAmount, sideAmount: deck.sideAmount, commanderSelection: new Set(deck.commanderSelection)});
    })
    .catch(errorMsg => {
      this.setState({isLoading: false, error: errorMsg});
      this.props.history.push(ROUTES.deck + "/" + this.props.match.params.formatId);
    });
  }
  
  editInfo() {
    this.setState({showDeckInfo: !this.state.showDeckInfo});
  }
  
  render() {
    if (this.state.groups.length === 0 || this.state.isLoading) {
      return (
        <div className="main-page">
          <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
        </div>
      );
    }
    if (this.state.showDeckInfo) {
      return (
        <div className="main-page">
          <div className="singleApp">
            <h1>Edit Deck Info</h1>
            <h5 className="text-muted">Please give a name and a description to the deck</h5>
            <FormGroup>
              <FormLabel>Format Name <span className="text-muted">Needed to save and publish the deck</span></FormLabel>
              <FormControl placeholder="Enter Name Here" value={this.state.deckName} onChange={event => this.setState({deckName: event.target.value})} maxLength={25} />
            </FormGroup>
            <FormGroup>
              <FormLabel>Format Description <span className="text-muted">Needed to publish the deck</span></FormLabel>
              <FormControl as="textarea" rows="5" value={this.state.deckDescription} onChange={event => this.setState({deckDescription: event.target.value})} maxLength={250} />
            </FormGroup>
            <Button variant="primary" size="lg" className="fullWidth" onClick={this.editInfo}>Back</Button>
          </div>
        </div>
      );
    }
    
    return (
      <Container fluid>
        {this.state.error && <Row>
          <Alert dismissible variant="danger" className="fullWidth ml-3 mr-3 mt-2" onClose={() => this.setState({error: ""})}>
            <Alert.Heading>Error with deck</Alert.Heading>
            <p>{this.state.error}</p>
          </Alert>
        </Row>}
        {this.state.writeSucceed && <Row>
          <Alert dismissible variant="success" className="fullWidth ml-3 mr-3 mt-2" onClose={() => this.setState({writeSucceed: false})}>
            <Alert.Heading>Success!</Alert.Heading>
            <p>This deck can be found under <Link to="/owndecks">Your Decks</Link>, found <Link to={ROUTES.deck + "/" + this.props.match.params.formatId + "/" + this.props.match.params.deckId}>directly</Link> or you may view the landing page for your deck <Link to={ROUTES.deckdetails + "/" + this.props.match.params.formatId + "/" + this.props.match.params.deckId}>here.</Link> (Copy that link and send it to your friends!)</p>
          </Alert>      
        </Row>}
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
              accountState={this.state.accountState}
              publishDeck={this.state.hasUpdatedCards ? this.publishDeck : null}
              editInfo={this.editInfo}
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
}

export default withFirebase(withRouter(DeckBuilder));