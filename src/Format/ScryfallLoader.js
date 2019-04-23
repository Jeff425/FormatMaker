import React, { Component } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import CardObj from './../CardObj';

class ScryfallLoader extends Component {
  
  constructor(props) {
    super(props);
    this.state = {searchString: "", searchEnabled: true, searchResults: []};
    this.scryfallSearch = this.scryfallSearch.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchKeyPress = this.onSearchKeyPress.bind(this);
    this.scryfallLoop = this.scryfallLoop.bind(this);
    this.removeFromSearch = this.removeFromSearch.bind(this);
    this.addAllSearch = this.addAllSearch.bind(this);
  }
  
  onSearchChange(event) {
    this.setState({searchString: event.target.value});
  }
  
  onSearchKeyPress(target) {
    if (target.charCode===13) {
      this.scryfallSearch();
    }
  }
  
  scryfallSearch() {
    this.setState({searchEnabled: false});
    this.setState({searchResults: []});
    this.scryfallLoop("https://api.scryfall.com/cards/search?q=" + this.state.searchString);   
  }
  
  scryfallLoop(query) {
    fetch(query)
    .then(res => res.json())
    .then(
      (result) => {
        if (result.data) {
          const data = result.data.map((e) => {
            return {
              imageUri: e.image_uris ? e.image_uris.small : (e.card_faces ? e.card_faces[0].image_uris.small : "//:0"),
              gathererLink: e.related_uris.gatherer,
              name: e.name,
              type_line: e.type_line,
              oracle_text: e.oracle_text,
              colors: e.colors,
              color_identity: e.color_identity,
              cmc: e.cmc,
              id: e.id,
              price: e.prices.usd
            };
          });
          this.setState({searchResults: this.state.searchResults.concat(data)});
          if (!result.has_more) {
            this.setState({searchEnabled: true});
          }
          else {         
            setTimeout(() => {
              this.scryfallLoop(result.next_page);
            }, 100);
          }
        }
        else {
          this.setState({searchEnabled: true});
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  
  removeFromSearch(card) {
    const searchCopy = this.state.searchResults.filter(icard => icard !== card);
    this.setState({searchResults: searchCopy});
  }
  
  addAllSearch() {
    this.props.addBatch(this.state.searchResults);
  }
  
  render() {
    return (
      <div className="AppContainer">
        <h1>Scryfall Loader</h1>
        <InputGroup className="mt-4">
          <FormControl id="scryfallSearch" value={this.state.searchString} onChange={this.onSearchChange} onKeyPress={this.onSearchKeyPress} disabled={!this.state.searchEnabled} placeholder="Enter Scryfall search string here..." />
          <InputGroup.Append>
            <Button variant="primary" onClick={this.scryfallSearch} disabled={!this.state.searchEnabled}>{this.state.searchEnabled ? "Search" : "Loading..."}</Button>
          </InputGroup.Append>               
        </InputGroup>
        <div className="bottomExtension centerAlign mb-2">
          <label htmlFor="scryfallSearch">Scryfall Syntax guide can be found <a href="https://scryfall.com/docs/syntax" target="_blank" rel="noopener noreferrer">here</a></label>
          <hr className="mt-1 mb-1"/>
          <div>Examples:</div>
          <div>f:s usd&lt;0.05<span className="text-muted"> : All standard legal cards that cost less than $0.05</span></div>
          <div>r:common or usd&lt;0.10<span className="text-muted"> : Will find all commons and every card that costs less than $0.10</span></div>
        </div>
        {this.state.searchEnabled && this.state.searchResults.length > 0 && <Button variant="primary" className="mb-1" onClick={this.addAllSearch}>Add all to format</Button>}
        <div className="centerAlign">
          {this.state.searchEnabled && this.state.searchResults.map(card => (
            <CardObj card={card} key={card.id} onSelect={this.props.addCard} onRemove={this.removeFromSearch} />
          ))}
          {!this.state.searchEnabled && <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />}
        </div>
      </div>
    );
  }
}

export default ScryfallLoader;