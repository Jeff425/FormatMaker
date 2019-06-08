import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';
import ROUTES from './ROUTES';

class MainPage extends Component {
  
  componentDidMount() {
    ReactGA.pageview("/");
  }
  
  render() {
    return (
      <div className="main-page">
        <h1>FormatBuilder</h1>
        <h4>Create custom <b>Magic: The Gathering</b> formats and build decks for your formats</h4>
        <div className="main-page-button-bar mt-1">
          <div className="d-flex main-page-buttons mx-2 flex-column align-items-center">
            <Link to={ROUTES.format} className="fullWidth">
              <Button variant="primary" size="lg" className="fullWidth">Create Format</Button>
            </Link>
            <h6 className="text-muted">Requires Free Account</h6>
          </div>
          <div className="d-flex main-page-buttons mx-2 flex-column align-items-center">
            <Link to={ROUTES.deck} className="fullWidth">
              <Button variant="primary" size="lg" className="fullWidth">Build Deck</Button>
            </Link>
            <h6 className="text-muted">No Account Needed!</h6>
          </div>
        </div>
        <h3 className="mt-5">Checkout the <ReactGA.OutboundLink eventLabel="discord mainpage" to="https://discord.gg/S368yWs" target="_blank">Discord Channel!</ReactGA.OutboundLink></h3>
      </div>
    );
  }
}

export default MainPage;