import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import { Row as FormRow } from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import FormCheck from 'react-bootstrap/FormCheck';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { Link, withRouter } from 'react-router-dom';
import FormatEditor from './FormatEditor';
import ScryfallLoader from './ScryfallLoader';
import { scryfallPost } from './ScryfallQuery';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';

class FormatBuilderBase extends Component {
  
  constructor(props) {
    super(props);
    this.state = {name: "", desc: "", longDesc: "", showInfo: false, isLoading: true, hasUpdatedCards: true, commanderFormat: false, formatIds: new Set(["Plains", "Island", "Swamp", "Mountain", "Forest"]), sortingFunc: null, authUser: null, error: "", didSucceed: false, deckMin: 60, deckMax: 0, sideboardAllowed: true, sideMin: 0, sideMax: 15, groups: [
      {
        "groupName": "Legal Cards",
        "maxTotal": 0,
        "maxCopies": 4,
        "cards": [],
      },
      {
        "groupName": "Unlimited",
        "maxTotal": 0,
        "maxCopies": 0,
        "cards": [
          {
            "imageUri": "https://img.scryfall.com/cards/small/front/d/9/d92ef517-2417-43a2-8b1a-0673d1531c65.jpg?1557577493",
            "normalImage": "https://img.scryfall.com/cards/normal/front/d/9/d92ef517-2417-43a2-8b1a-0673d1531c65.jpg?1557577493",
            "gathererLink": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=461177",
            "name": "Plains",
            "type_line": "Basic Land — Plains",
            "oracle_text": "({T}: Add {W}.)",
            "colors": [],
            "color_identity": [
              "W"
            ],
            "cmc": 0,
            "id": "51ff6ee0-01f4-432f-916b-ed771904d64c"
          },
          {
            "imageUri": "https://img.scryfall.com/cards/small/front/7/0/7014b9fc-a906-4ffd-a482-22ba8dbe3b4a.jpg?1557577515",
            "normalImage": "https://img.scryfall.com/cards/normal/front/7/0/7014b9fc-a906-4ffd-a482-22ba8dbe3b4a.jpg?1557577515",
            "gathererLink": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=461180",
            "name": "Island",
            "type_line": "Basic Land — Island",
            "oracle_text": "({T}: Add {U}.)",
            "colors": [],
            "color_identity": [
              "U"
            ],
            "cmc": 0,
            "id": "40c840af-9a13-4716-8458-09071239cc26"
          },
          {
            "imageUri": "https://img.scryfall.com/cards/small/front/2/4/24eeb424-235d-4346-9355-57914e740ec6.jpg?1557577534",
            "normalImage": "https://img.scryfall.com/cards/normal/front/2/4/24eeb424-235d-4346-9355-57914e740ec6.jpg?1557577534",
            "gathererLink": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=461183",
            "name": "Swamp",
            "type_line": "Basic Land — Swamp",
            "oracle_text": "({T}: Add {B}.)",
            "colors": [],
            "color_identity": [
              "B"
            ],
            "cmc": 0,
            "id": "db69a637-5770-4eea-9b04-c00e6f90a12a"
          },
          {
            "imageUri": "https://img.scryfall.com/cards/small/front/4/8/489fdba7-5c25-4cf3-a1e0-3e0fda6c6ee6.jpg?1557577552",
            "normalImage": "https://img.scryfall.com/cards/normal/front/4/8/489fdba7-5c25-4cf3-a1e0-3e0fda6c6ee6.jpg?1557577552",
            "gathererLink": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=461186",
            "name": "Mountain",
            "type_line": "Basic Land — Mountain",
            "oracle_text": "({T}: Add {R}.)",
            "colors": [],
            "color_identity": [
              "R"
            ],
            "cmc": 0,
            "id": "15c96b83-d0b3-4da9-bb2d-249cc18b55e9"
          },
          {
            "imageUri": "https://img.scryfall.com/cards/small/front/a/9/a9d61651-349e-40d0-a7c4-c9561e190405.jpg?1557577572",
            "normalImage": "https://img.scryfall.com/cards/normal/front/a/9/a9d61651-349e-40d0-a7c4-c9561e190405.jpg?1557577572",
            "gathererLink": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=461189",
            "name": "Forest",
            "type_line": "Basic Land — Forest",
            "oracle_text": "({T}: Add {G}.)",
            "colors": [],
            "color_identity": [
              "G"
            ],
            "cmc": 0,
            "id": "7eef5e5c-27be-45f2-a9c8-4e0a65c984d4"
          }
        ]
      }
    ], currentTab: "extra_Legal Cards"};
    this.addFromLoader = this.addFromLoader.bind(this);
    this.addFromLoaderBatch = this.addFromLoaderBatch.bind(this);
    this.remove = this.remove.bind(this);
    this.sort = this.sort.bind(this);
    this.saveFormat = this.saveFormat.bind(this);
    this.onGroupSubmit = this.onGroupSubmit.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.onGroupDelete = this.onGroupDelete.bind(this);
    this.successWrite = this.successWrite.bind(this);
    this.errorWrite = this.errorWrite.bind(this);
    this.editControl = this.editControl.bind(this);
    this.readFormat = this.readFormat.bind(this);
    this.successRead = this.successRead.bind(this);
    this.errorRead = this.errorRead.bind(this);
    this.changeDeckMin = this.changeDeckMin.bind(this);
    this.changeDeckMax = this.changeDeckMax.bind(this);
    this.updateFormat = this.updateFormat.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.format + "/" + (this.props.match.params.formatId ? this.props.match.params.formatId : ""));
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (!auth.emailVerified) {
          this.props.history.push(ROUTES.emailverify);
          return;
        }
        this.setState({authUser: auth});
        if (this.props.match.params.formatId) {
          this.readFormat(this.props.match.params.formatId);
        } else {
          this.setState({isLoading: false});
        }
      } else {
        this.props.history.push(ROUTES.signin + ROUTES.format + encodeURIComponent("/") + (this.props.match.params.formatId ? encodeURIComponent(this.props.match.params.formatId) : ""));
        ReactGA.event({category: "Redirection", action: "Format to sign in page"});
      }
    });
  }
  
  componentWillUnmount() {
    this.listener();
  }
  
  editControl(event, control) {
    this.setState({[control]: event.target.value});
  }
  
  addFromLoader(card) {
    if(this.state.currentTab === "addGroup") {
      return;
    }
    if (card.name && !this.state.formatIds.has(card.name)) {
      this.setState({formatIds: this.state.formatIds.add(card.name)});
      const newGroups = [...this.state.groups];
      const groupName = this.state.currentTab.substring(6); 
      newGroups.forEach(group => {
        if (group.groupName === groupName) {
          group.cards = group.cards.concat(card);
        }
      });
      this.setState({groups: newGroups});
      this.sort(this.state.sortingFunc, null, newGroups);
    }   
  }
  
  addFromLoaderBatch(cards) {
    if(this.state.currentTab === "addGroup") {
      return;
    }
    const newCards = [];
    cards.forEach(card => {
      if (card.name && !this.state.formatIds.has(card.name)) {
        newCards.push(card);
        this.state.formatIds.add(card.name);
      }
    });
    const newGroups = [...this.state.groups];
    const groupName = this.state.currentTab.substring(6); 
    newGroups.forEach(group => {
      if (group.groupName === groupName) {
        group.cards = group.cards.concat(newCards);
      }
    });
    this.setState({groups: newGroups});
    this.sort(this.state.sortingFunc, null, newGroups);
  }
  
  remove(card) {
    const idCopy = new Set(this.state.formatIds);
    idCopy.delete(card.name);
    this.setState({formatIds: idCopy});
    const newGroups = [...this.state.groups];
    const groupName = this.state.currentTab.substring(6); 
    newGroups.forEach(group => {
      if (group.groupName === groupName) {
        group.cards = group.cards.filter(icard => icard !== card);
      }
    });
    this.setState({groups: newGroups});
    this.sort(this.state.sortingFunc, null, newGroups);
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
  
  saveFormat() {
    if (this.state.name !== "" && this.state.desc !== "") {
      this.props.firebase.writeFormat(this.state.authUser, this.state.name, this.state.desc, this.state.longDesc, this.state.hasUpdatedCards, this.state.commanderFormat, JSON.stringify({deckMin: this.state.deckMin, deckMax: this.state.deckMax, sideboardAllowed: this.state.sideboardAllowed, sideMin: this.state.sideMin, sideMax: this.state.sideMax, groups: this.state.groups}), this.successWrite, this.errorWrite, this.props.match.params.formatId);
      this.setState({isLoading: true, error: ""});
    } else {
      this.setState({showInfo: true});
    }
  }
  
  successWrite(firebaseId) {
    this.setState({didSucceed: true});
    this.props.history.push(ROUTES.format + "/" + firebaseId);
    this.readFormat(firebaseId);
  }
  
  errorWrite(errorMessage) {
    this.setState({error: errorMessage, isLoading: false});
  }
  
  readFormat(firebaseId) {
    this.props.firebase.readFormat(firebaseId, this.successRead, this.errorRead, true, this.state.authUser);
  }
  
  successRead(name, desc, longDesc, hasUpdatedCards, commanderFormat, formatText) {
    this.setState({name: name, desc: desc, longDesc: longDesc, showInfo: false, isLoading: false, error: ""});
    const formatIds = new Set();
    const format = JSON.parse(formatText);
    format.groups.forEach(group => {
      group.cards.forEach(card => {
        formatIds.add(card.name);
      });
    });
    format.deckMin = format.deckMin ? format.deckMin : 0;
    format.deckMax = format.deckMax ? format.deckMax : 0;
    format.sideMin = format.sideMin ? format.sideMin : 0;
    format.sideMax = format.sideMax ? format.sideMax : 0;
    const sideboardAllowed = format.sideboardAllowed || format.sideboardAllowed !== false;
    this.setState({commanderFormat: !!commanderFormat, hasUpdatedCards: !!hasUpdatedCards, formatIds: formatIds, currentTab: format.groups.length > 0 ? "extra_" + format.groups[0].groupName : "addGroup", deckMin: format.deckMin, deckMax: format.deckMax, sideboardAllowed: sideboardAllowed, sideMin: format.sideMin, sideMax: format.sideMax});
    if (this.state.sortingFunc) {
      this.sort(this.state.sortingFunc, format.groups);
    } else {
      this.setState({groups: format.groups});
    }
  }
  
  errorRead(errorMessage) {
    this.props.history.push(ROUTES.format);
    this.setState({error: errorMessage, isLoading: false});
  }
  
  onGroupSubmit(groupName, maxTotal, maxCopies, usePointSystem, maxPoints) {
    for (let i = 0; i < this.state.groups.length; i++) {
      if (this.state.groups[i].groupName === groupName) {
        const newGroups = [...this.state.groups];
        newGroups[i] = {groupName: groupName, maxTotal: maxTotal, maxCopies: maxCopies, usePointSystem: usePointSystem, maxPoints: maxPoints, cards: newGroups[i].cards};
        this.setState({groups: newGroups});
        return;
      }
    }
    const newGroup = {groupName: groupName, maxTotal: maxTotal, maxCopies: maxCopies, usePointSystem: usePointSystem, maxPoints: maxPoints, cards: []};
    this.setState({groups: this.state.groups.concat(newGroup), currentTab: "extra_" + groupName});
  }
  
  onGroupDelete(groupName) {
    const deletedGroup = this.state.groups.find(otherGroup => otherGroup.groupName === groupName);
    if (deletedGroup) {
      const newIds = new Set(this.state.formatIds);
      deletedGroup.cards.forEach(card => {
        newIds.delete(card.name);
      });
      this.setState({currentTab: "addGroup", groups: this.state.groups.filter(otherGroup => otherGroup.groupName !== groupName), formatIds: newIds});
    }
  }
  
  onTabChange(key) {
    this.setState({currentTab: key});
  }
  
  changeDeckMin(event, sideboard = false) {
    const nextValue = parseInt(event.target.value);
    const min = sideboard ? "sideMin" : "deckMin";
    const max = sideboard ? "sideMax" : "deckMax";
    if (isNaN(nextValue)) {
      this.setState({[min]: "0"});
      return;
    } else if (nextValue < 0) {
      this.setState({[min]: Math.abs(nextValue)});
      return;
    }
    let newMax = parseInt(this.state[max]);
    if (newMax > 0 && newMax < nextValue) {
      newMax = nextValue;
    }
    this.setState({[min]: nextValue, [max]: newMax});
  }
  
  changeDeckMax(event, sideboard = false) {
    const nextValue = parseInt(event.target.value);
    const min = sideboard ? "sideMin" : "deckMin";
    const max = sideboard ? "sideMax" : "deckMax";
    if (isNaN(nextValue)) {
      this.setState({[max]: "0"});
      return;
    } else if (nextValue < 0) {
      this.setState({[max]: Math.abs(nextValue)});
      return;
    }
    let newMin = parseInt(this.state[min]);
    if (nextValue > 0 && nextValue < newMin) {
      newMin = nextValue;
    }
    this.setState({[max]: nextValue, [min]: newMin});
  }
  
  updateFormat() {
    const groups = [...this.state.groups];
    this.setState({isLoading: true});
    Promise.all(this.state.groups.map((group, i) => {
      return new Promise((resolve, reject) => scryfallPost(group.cards, this.props.firebase).then(result => {
        const newGroup = group;
        newGroup.cards = result.foundCards;
        groups[i] = newGroup; //groupIndex matters
        if (result.notFound.length > 0) {
          console.warn("Could not find these cards:", result.notFound);
        }
        resolve(null);
      }).catch(reject));
    }))
    .then(() => {
      this.setState({groups: groups, isLoading: false, hasUpdatedCards: true});
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
    if (this.state.showInfo) {
      return (
        <div className="main-page">
          {this.state.error && <Alert dismissible variant="danger" className="fullWidth ml-3 mr-3 mt-2" onClose={() => this.setState({error: ""})}>
            <Alert.Heading>Error with format</Alert.Heading>
            <p>{this.state.error}</p>
          </Alert>}
          <div className="singleApp">
            <h1>Edit Format Info</h1>
            <h5 className="text-muted">Please give a name and a description to the format</h5>
            <FormGroup>
              <FormLabel>Format Name</FormLabel>
              <FormControl placeholder="Enter Name Here" value={this.state.name} onChange={event => this.editControl(event, "name")} maxLength={25} />
            </FormGroup>
            <FormGroup>
              <FormLabel>Format Description</FormLabel>
              <FormControl as="textarea" rows="5" value={this.state.desc} onChange={event => this.editControl(event, "desc")} maxLength={250} />
            </FormGroup>
            <FormGroup>
              <FormLabel>Long Format Description <span className="text-muted">For format details page</span> <ReactGA.OutboundLink eventLabel="Markdown Lookup" to="https://guides.github.com/features/mastering-markdown/" target="_blank">Markdown Supported</ReactGA.OutboundLink></FormLabel>
              <FormControl as="textarea" rows="5" value={this.state.longDesc} onChange={event => this.editControl(event, "longDesc")} maxLength={20000} />
            </FormGroup>
            <FormRow>
              <FormGroup as={Col}>
                <FormLabel>Deck Size Minimum</FormLabel>
                <FormControl required type="number" min="0" value={this.state.deckMin} onChange={this.changeDeckMin} />
              </FormGroup>
              <FormGroup as={Col}>
                <FormLabel>Deck Size Maximum <span className="text-muted">(0 for unlimited)</span></FormLabel>
                <FormControl required type="number" min="0" value={this.state.deckMax} onChange={this.changeDeckMax} />
              </FormGroup>
            </FormRow>
            <FormGroup>
              <FormCheck type="checkbox" label="Allow Sideboard?" checked={this.state.sideboardAllowed} onChange={event => this.setState({sideboardAllowed: event.target.checked})} />
            </FormGroup>
            {this.state.sideboardAllowed && (
              <FormRow>
                <FormGroup as={Col}>
                  <FormLabel>Sideboard Minimum</FormLabel>
                  <FormControl required type="number" min="0" value={this.state.sideMin} onChange={event => this.changeDeckMin(event, true)} />
                </FormGroup>
                <FormGroup as={Col}>
                  <FormLabel>Sideboard Maximum <span className="text-muted">(0 for unlimited)</span></FormLabel>
                  <FormControl required type="number" min="0" value={this.state.sideMax} onChange={event => this.changeDeckMax(event, true)} />
                </FormGroup>
              </FormRow>
            )}
            <FormGroup>
              <FormCheck type="checkbox">
                <FormCheck.Input type="checkbox" checked={this.state.commanderFormat} onChange={event => this.setState({commanderFormat: event.target.checked})} />
                <FormCheck.Label>Format uses the command zone <span className="text-muted">(Such as Commander or Oathbreaker)</span></FormCheck.Label>
              </FormCheck>
            </FormGroup>
            <div className="d-flex flex-row">
              <Button variant="primary" size="lg" onClick={() => this.setState({showInfo: false})}>Back</Button>
              <Button variant="primary" size="lg" className="flex-grow-1 ml-3" onClick={this.saveFormat}>Submit</Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <Container fluid>
        {this.state.error && <Row>
          <Alert dismissible variant="danger" className="fullWidth ml-3 mr-3 mt-2" onClose={() => this.setState({error: ""})}>
            <Alert.Heading>Error with format</Alert.Heading>
            <p>{this.state.error}</p>
          </Alert>
        </Row>}
        {this.state.didSucceed && <Row>
          <Alert dismissible variant="success" className="fullWidth ml-3 mr-3 mt-2" onClose={() => this.setState({didSucceed: false})}>
            <Alert.Heading>Success!</Alert.Heading>
            <p>This format can be found under <Link to="/ownformats">Your Formats</Link>, found <Link to={ROUTES.format + "/" + this.props.match.params.formatId}>directly</Link> or you may view the landing page for your format <Link to={ROUTES.formatdetails + "/" + this.props.match.params.formatId}>here.</Link> (Copy that link and send it to your friends!)</p>
          </Alert>      
        </Row>}
        {!this.state.hasUpdatedCards && <Row className="align-items-center flex-column">
          <Button className="mt-5" variant="primary" size="lg" onClick={this.updateFormat}>Update format to support publishing decks</Button>
          <div className="text-warning">May take a long time!</div>
        </Row>}
        <Row>
          <Col lg>
            <FormatEditor 
              removeCard={this.remove} 
              sortPass={this.sort} 
              onSave={this.saveFormat} 
              onInfo={() => this.setState({showInfo: true})} 
              onSubmitGroup={this.onGroupSubmit}
              onDeleteGroup={this.onGroupDelete}
              groups={this.state.groups}
              tabKey={this.state.currentTab}
              onTabChange={this.onTabChange}
            />
          </Col>
          <Col lg>
            <ScryfallLoader addCard={this.addFromLoader} addBatch={this.addFromLoaderBatch} />
          </Col>
        </Row>
      </Container>
    );
  }
}

const FormatBuilder = withFirebase(withRouter(FormatBuilderBase));

export default FormatBuilder;