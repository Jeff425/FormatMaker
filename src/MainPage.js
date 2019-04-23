import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

class MainPage extends Component {
  render() {
    return (
      <div className="main-page">
        <h1>FormatMaker</h1>
        <h4>Create custom magic formats and build decks for your formats</h4>
        <div className="main-page-button-bar">
          <Link to="/format" className="main-page-buttons">
            <Button variant="primary" size="lg" className="fullWidth">Create Format</Button>
          </Link>
          <Link to="/deck" className="main-page-buttons">
            <Button variant="primary" size="lg" className="fullWidth">Build Deck</Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default MainPage;