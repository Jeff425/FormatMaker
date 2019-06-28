import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { Link, withRouter } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import TitledDivider from './TitledDivider';
import DeckCard from './DeckCard';

class OwnDeckSelector extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formatDecks: [], authUser: null, error: ""};
    
    this.removeDeck = this.removeDeck.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.owndecks);
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (!auth.emailVerified) {
          this.props.history.push(ROUTES.emailverify);
          return;
        }
        this.setState({authUser: auth});
        this.loadDecks();
      } else {
        this.props.history.push(ROUTES.signin + ROUTES.ownformat);
      }
    });
  }
  
  componentWillUnmount() {
    this.listener();
  }
  
  loadDecks() {
    const formatDecks = [];
    const formatIndex = {};
    this.props.firebase.queryYourDecks()
    .then(decks => {
      decks.forEach(doc => {
        const deck = {...doc.data()};
        deck.id = doc.id;
        if (!(deck.formatId in formatIndex)) {
          formatIndex[deck.formatId] = formatDecks.length;
          formatDecks.push({decks: [deck]});
        } else {
          formatDecks[formatIndex[deck.formatId]].decks.push(deck);
        }
        const promises = Object.keys(formatIndex).map(formatId => this.props.firebase.getFormatMetadata(formatId).then(formatDataDoc => {
          if (formatDataDoc.exists) {
            formatDecks[formatIndex[formatId]].name = formatDataDoc.data().name;
            formatDecks[formatIndex[formatId]].id = formatDataDoc.id;
          }
        }));
        Promise.all(promises)
        .then(() => {
          this.setState({formatDecks: formatDecks, isLoading: false});
        });
      });
    });
  }
  
  removeDeck(formatId, deckId) {
    this.setState({isLoading: true});
    this.props.firebase.deleteDeck(formatId, deckId)
    .then(() => {
      this.loadDecks();
    })
    .catch(errorMsg => {
      this.setState({error: errorMsg, isLoading: false});
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
    const formatDecks = this.state.formatDecks.filter(formatDeckObj => formatDeckObj.name);
    if (formatDecks.length < 1) {
      return (
        <div className="main-page">
          <h1>No Decks Found</h1>
          <h6>You may create one for a custom format <Link to={ROUTES.deck}>here</Link></h6>
        </div>
      );
    }
    return (
      <div className="AppContainer fullWidth align-items-start mt-2">
        {this.state.error && <Alert dismissible variant="danger" className="fullWidth ml-3 mr-3" onClose={() => this.setState({error: ""})}>
          <Alert.Heading>Error deleting format</Alert.Heading>
          <p>{this.state.error}</p>
        </Alert>}
        {formatDecks.map(formatDeckObj => (<Row className="fullWidth mx-2" key={formatDeckObj.id}>
          <TitledDivider title={formatDeckObj.name} link={ROUTES.formatdetails + "/" + formatDeckObj.id} />
          {formatDeckObj.decks.map(deck => <DeckCard key={deck.id} deck={deck} formatId={formatDeckObj.id} removeDeck={this.removeDeck} />)}
        </Row>))}
      </div>
    );
  }
}

export default withFirebase(withRouter(OwnDeckSelector));