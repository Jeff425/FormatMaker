import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import FormCheck from 'react-bootstrap/FormCheck';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import CardSection from './CardSection';
import { saveDeckFile, purchaseDeck } from './DeckUtils';

class DeckDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {deckData: null, isLoading: true, showReportForm: false, reportReason: "", disableReport: false, reportFeedback: "", simpleView: true}
    this.purchaseDeck = this.purchaseDeck.bind(this);
    this.saveDeck = this.saveDeck.bind(this);
    this.sendReport = this.sendReport.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.deckdetails + "/" + this.props.match.params.formatId + "/" + this.props.match.params.deckId);
    this.props.firebase.readDeck(this.props.match.params.formatId, this.props.match.params.deckId)
    .then(deck => {
      const deckData = {deckName: deck.deckName, deckDescription: deck.deckDescription, authorName: deck.authorName, cardGroups: JSON.parse(deck.deckText)};
      this.setState({deckData: deckData, isLoading: false});
    });
  }
  
  sumGroup(group) {
    let groupCount = 0;
    group.forEach(card => groupCount += this.state.deckData.cardGroups.deckAmount[card.name]);
    return groupCount;
  }
  
  purchaseDeck() {
    ReactGA.event({category: "Affiliate Link", action: "TCGPlayer", label: this.props.match.params.formatId + "/" + this.props.match.params.deckId});
    purchaseDeck(this.state.deckData.cardGroups.deckSelection, this.state.deckData.cardGroups.deckAmount, this.state.deckData.cardGroups.sideSelection, this.state.deckData.cardGroups.sideAmount);
  }
  
  saveDeck(fileType) {
    saveDeckFile(this.state.deckData.deckName, fileType, this.state.deckData.cardGroups.deckSelection, this.state.deckData.cardGroups.deckAmount, this.state.deckData.cardGroups.sideSelection, this.state.deckData.cardGroups.sideAmount, this.state.deckData.cardGroups.commanderSelection);
  }
  
  sendReport() {
    this.setState({disableReport: true, showReportForm: false});
    this.props.firebase.reportDeck(this.props.match.params.formatId, this.props.match.params.deckId, this.state.reportReason)
    .then(() => {
      this.setState({reportFeedback: "Report Sent!"});
    })
    .catch(() => {
      this.setState({reportFeedback: "Error Sending Report"});
    });
  }
  
  render() {
    if (this.state.isLoading) {
      return (
        <div className="main-page">
          <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
        </div>
      );
    }
    const commanders = this.state.deckData.cardGroups.deckSelection.filter(card => this.state.deckData.cardGroups.commanderSelection.includes(card.name));
    const nonCommanders = this.state.deckData.cardGroups.deckSelection.filter(card => !this.state.deckData.cardGroups.commanderSelection.includes(card.name));
    const creatures = nonCommanders.filter(card => card.type_line.toLowerCase().includes("creature"));
    const lands = nonCommanders.filter(card => card.type_line.toLowerCase().includes("land") && !card.type_line.toLowerCase().includes("creature"));
    const instantsAndSorceries = nonCommanders.filter(card => (card.type_line.toLowerCase().includes("instant") || card.type_line.toLowerCase().includes("sorcery")) && !card.type_line.toLowerCase().includes("land") && !card.type_line.toLowerCase().includes("creature"));
    const otherCards = nonCommanders.filter(card => !(card.type_line.toLowerCase().includes("land") || card.type_line.toLowerCase().includes("creature") || card.type_line.toLowerCase().includes("instant") || card.type_line.toLowerCase().includes("sorcery")));
    
    const creatureCount = this.sumGroup(creatures);
    const landCount = this.sumGroup(lands);
    const instantAndSoceryCount = this.sumGroup(instantsAndSorceries);
    const otherCount = this.sumGroup(otherCards);
    
    let deckCount = 0;
    Object.values(this.state.deckData.cardGroups.deckAmount).forEach(value => deckCount += value);
    
    let sideCount = 0;
    Object.values(this.state.deckData.cardGroups.sideAmount).forEach(value => sideCount += value);
    
    return (
      <Container className="marginTop30px">
        <Row className="px-2">
          <Col>
            <h1 className="pr-1">{this.state.deckData.deckName}</h1>
            {this.state.deckData.authorName && <h4 className="text-muted">{this.state.deckData.authorName}</h4>}
          </Col>
          <Col md="auto">
            <div className="d-flex flex-column mb-1">
              <Button variant="danger" onClick={event => this.setState({showReportForm: true})} disabled={this.state.disableReport} className="my-auto">Report Deck</Button>
              {this.state.reportFeedback && <div className="text-muted text-center">{this.state.reportFeedback}</div>}
            </div>
            <div className="d-flex flex-column">
              <Button variant="primary" onClick={() => this.props.history.push(ROUTES.formatdetails + "/" + this.props.match.params.formatId)}>Return to Format</Button>
            </div>
          </Col>
        </Row>
        <hr />
        <Row className="px-4 mb-4 d-block">{this.state.deckData.deckDescription}</Row>
        <Row className="px-4 justify-content-center">
          <ButtonGroup>
            <Button variant="info" onClick={this.purchaseDeck}>Purchase on TCGPlayer</Button>
            <Button onClick={() => this.saveDeck(0)}>Export to Cockatrice</Button>
            <Button onClick={() => this.saveDeck(1)}>Export to FormatBuilder</Button>
          </ButtonGroup>
        </Row>
        <Row className="px-2 mt-2">
          <div className="h4 mb-0 mr-auto">{(deckCount + sideCount) + " Total Cards"}</div>
          <FormCheck inline type="checkbox" label="View cards as images" checked={!this.state.simpleView} onChange={event => this.setState({simpleView: !event.target.checked})} />
        </Row>
        <Row>
          <Col lg={true}>
            <CardSection simpleView={this.state.simpleView} title="Commander" cards={commanders} deckAmount={this.state.deckData.cardGroups.deckAmount} />
            <CardSection simpleView={this.state.simpleView} title={"Creatures (" + creatureCount + ")"} cards={creatures} deckAmount={this.state.deckData.cardGroups.deckAmount} />
            <CardSection simpleView={this.state.simpleView} title={"Instants/Sorceries (" + instantAndSoceryCount + ")"} cards={instantsAndSorceries} deckAmount={this.state.deckData.cardGroups.deckAmount} />
            <CardSection simpleView={this.state.simpleView} title={"Other (" + otherCount + ")"} cards={otherCards} deckAmount={this.state.deckData.cardGroups.deckAmount} />
          </Col>
          <Col lg={true}>
            <CardSection simpleView={this.state.simpleView} title={"Lands (" + landCount + ")"} cards={lands} deckAmount={this.state.deckData.cardGroups.deckAmount} />
            <CardSection simpleView={this.state.simpleView} title={"Sideboard (" + sideCount + ")"} cards={this.state.deckData.cardGroups.sideSelection} deckAmount={this.state.deckData.cardGroups.sideAmount} />
          </Col>
        </Row>
        
        <Modal show={this.state.showReportForm} onHide={event => this.setState({showReportForm: false})}>
          <Modal.Header closeButton>
            <Modal.Title>Report {this.state.deckData.deckName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <FormLabel>What is the reason?</FormLabel>
              <FormControl placeholder="Enter Reason" value={this.state.reportReason} onChange={event => this.setState({reportReason: event.target.value})} as="textarea" rows="5" maxLength={250} />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={this.sendReport}>Send Report</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}

export default withFirebase(DeckDetails);