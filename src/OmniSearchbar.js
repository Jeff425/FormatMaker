import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import FormCheck from 'react-bootstrap/FormCheck';

class OmniSearchbar extends Component {
  
  constructor(props) {
    super(props);
    this.state = {searchString: "", sortByAlpha: false};
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.checkCard = this.checkCard.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    this.textCheck = this.textCheck.bind(this);
    this.colorCheck = this.colorCheck.bind(this);
    this.searchTimer = -1;
    if (this.props.sortPass) {
      this.props.sortPass(this.cmcSort);
    }
    this.colorRefs = {};
  }
  
  onSearchChange(event) {
    if (this.searchTimer > -1) {
      clearTimeout(this.searchTimer);
    }
    const searchString = event.target.value;
    this.setState({searchString: searchString});
    this.searchTimer = setTimeout(() => {     
      this.props.onSearchChange(card => this.checkCard(card, this.state.searchString));
    }, 750);
  }
  
  onCheckboxChange() {
    if (this.searchTimer > -1) {
      clearTimeout(this.searchTimer);
      this.searchTimer = -1;
    }
    this.props.onSearchChange(card => this.checkCard(card, this.state.searchString));
  }
  
  checkCard(card, searchString) {
    if(!this.colorCheck(card)) {
      return false;
    }
    if(!this.textCheck(card, searchString)) {
      return false;
    }
    return true;
  }
  
  textCheck(card, searchString) {
    let search = searchString.toLowerCase();
    if ((card.name && card.name.toLowerCase().includes(search)) ||
        (card.type_line && card.type_line.toLowerCase().includes(search)) ||
        (card.oracle_text && card.oracle_text.toLowerCase().includes(search))) {
      return true;
    } else {
      return false
    }
  }
  
  colorCheck(card) {
    let colors = card.colors;
    if(!colors) {
      colors = card.color_identity;
      if(!colors) {
        return false;
      }
    }
    if(colors.length === 0) {
      return this.colorRefs.colorCheck_Colorless.checked;
    }
    for(let i = 0; i < colors.length; i++) {
      if(!this.colorRefs["colorCheck_" + colors[i]].checked) {
        return false;
      }
    }
    return true;
  }
  
  toggleSort() {    
    if (!this.state.sortByAlpha) {
      this.props.sortPass(this.alphaSort);
    } else {
      this.props.sortPass(this.cmcSort);
    }
    this.setState({sortByAlpha: !this.state.sortByAlpha});
  }
  
  alphaSort(cards) {
    return cards.sort((a, b) => {
      return ('' + a.name).localeCompare(b.name);
    });
  }
  
  cmcSort(cards) {
    return cards.sort((a, b) => {
      return a.cmc - b.cmc;
    });
  }
  
  render() {
    return (
      <div className="fullWidth mb-2">
        <InputGroup className="mt-4">
          <FormControl value={this.state.searchString} onChange={this.onSearchChange} placeholder="Enter card name, card type, card effect or description here..." />
          {this.props.sortPass && (
          <InputGroup.Append>
            <Button variant="primary" onClick={this.toggleSort}>{this.state.sortByAlpha ? "Sort by CMC" : "Sort Alphabetically"}</Button>
          </InputGroup.Append>)}
        </InputGroup>
        <div className="omniCheckboxes">
          <FormCheck inline label="White" type="checkbox" ref={ref => this.colorRefs["colorCheck_W"] = ref} defaultChecked={true} onChange={this.onCheckboxChange} />
          <FormCheck inline label="Blue" type="checkbox" ref={ref => this.colorRefs["colorCheck_U"] = ref} defaultChecked={true} onChange={this.onCheckboxChange} />
          <FormCheck inline label="Black" type="checkbox" ref={ref => this.colorRefs["colorCheck_B"] = ref} defaultChecked={true} onChange={this.onCheckboxChange} />
          <FormCheck inline label="Red" type="checkbox" ref={ref => this.colorRefs["colorCheck_R"] = ref} defaultChecked={true} onChange={this.onCheckboxChange} />
          <FormCheck inline label="Green" type="checkbox" ref={ref => this.colorRefs["colorCheck_G"] = ref} defaultChecked={true} onChange={this.onCheckboxChange} />
          <FormCheck inline label="Colorless" type="checkbox" ref={ref => this.colorRefs["colorCheck_Colorless"] = ref} defaultChecked={true} onChange={this.onCheckboxChange} />
        </div>
      </div>
    );
  }
}

export default OmniSearchbar;