import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import ROUTES from './ROUTES';

class MainPage extends Component {
  render() {
    return (
      <div className="main-page">
        <h1>FormatBuilder</h1>
        <h4>Create custom <b>Magic: The Gathering</b> formats and build decks for your formats</h4>
        <div className="main-page-button-bar">
          <Link to={ROUTES.format} className="main-page-buttons">
            <Button variant="primary" size="lg" className="fullWidth">Create Format</Button>
          </Link>
          <Link to={ROUTES.deck} className="main-page-buttons">
            <Button variant="primary" size="lg" className="fullWidth">Build Deck</Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default MainPage;