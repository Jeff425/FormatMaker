import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class HowToUse extends Component {
  
  render() {
    return (
      <Container fluid>
        <Row>
          <Col lg>
            <div className="AppContainer">
              <h1>Creating a Format</h1>
              <p className="font-weight-bold mt-2">
              Essentially you are loading cards found from Scryfall searches and adding them to the format. 
              The format is separated into different groups for different legalities. 
              You may have a group of cards that allow 4 copies of each card (default as &quot;Legal Cards&quot;), a group that allows unlimited copies of each card for things like basic lands (default as &quot;Unlimited&quot;), or your own custom group.
              </p>
              <ol>
                <li>Under &quot;Format Editor&quot; select which group you would like to add cards to. Use the &quot;Add Group&quot; tab to create a new group</li>
                <li>Under &quot;Scryfall Loader&quot; enter a search string of cards to add. i.e. &quot;f:s r:common&quot; will fetch all commons legal in standard (standard pauper.) Scryfall search syntax guide can be found <a href="https://scryfall.com/docs/syntax" target="_blank" rel="noopener noreferrer">here</a></li>
                <li>Once Scryfall has finished loading your request, you may either individually select the cards to add to your format, or you may press &quot;Add All to format&quot; at the top of the results.</li>
                <li>Repeat for each group until you are satisfied with your format</li>
                <li>You may remove cards from your format by hovering over the card and selecting the red &quot;X&quot; button. You may also search for the card you wish to remove using the search bar at the top</li>
                <li>Once you are happy with your format, you may press the &quot;Submit&quot; button on the left. You will be given a prompt to name and describe your format.</li>
                <li>If it is successful you will be given a success message with links to edit the format in the future and also a link to create a deck in the format</li>
              </ol>
            </div>
          </Col>
          <Col lg>
            <div className="AppContainer">
              <h1>Building a Deck</h1>
              <p className="font-weight-bold mt-2">
              You may search for and choose cards in a format in order to build a deck. The application should keep track of the legality of your deck in regards to the format. Most likely you will have a direct link to the format.
              </p>
              <ol>
                <li>Use the search bar under &quot;Format Editor&quot; to narrow down the cards to the ones you want. The application will search under card names, types, effects and flavor text.</li>
                <li>Add the desired cards to your deck</li>
                <li>Make sure you add in lands, basic lands should be found under &quot;Unlimited&quot; unless the format owner modified that group</li>
                <li>Once you are satisfied with your deck, you may select &quot;Export Deck&quot; to save your deck in plaintext</li>
                <li>Keep in mind, if you open a decklist for another format and there are cards not in the current format, the cards will simply not show up on the deck editor</li>
              </ol>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default HowToUse;