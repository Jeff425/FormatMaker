import React, { Component } from 'react';
import OmniSearchbar from './../OmniSearchbar';
import CardObj from './../CardObj';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { Link } from 'react-router-dom';

class CardSelection extends Component {
   
  constructor(props) {
    super(props);
    this.state = {cardCheck: () => {return true;}};
    this.onOmniChange = this.onOmniChange.bind(this);
  }
  
  onOmniChange(checkCard) {
    this.setState({cardCheck: checkCard});
  }
  
  render() {  
    return (
      <div className="AppContainer">
        <h1>Card Selection</h1>
        <OmniSearchbar onSearchChange={this.onOmniChange} sortPass={this.props.sortPass} />
        <Link to="/deck" className="fullWidth">
          <Button variant="primary" className="fullWidth">Select Another Format</Button>
        </Link>
        <div className="fullWidth mt-1">
          <Tabs activeKey={this.props.tabKey} onSelect={this.props.onTabChange}>
            {this.props.groups && this.props.groups.map(group => {
              return (
                <Tab eventKey={"extra_" + group.groupName} title={group.groupName} key={"extra_" + group.groupName}>
                  <div className="bottomExtension topTab">
                    <div>
                      Maximum Total: {(group.maxTotal === 0 || group.maxTotal === "0") ? "Unlimited" : group.maxTotal}
                    </div>
                    <div className="right mr-2">
                      Maximum Copies: {(group.maxCopies === 0 || group.maxCopies === "0") ? "Unlimited" : group.maxCopies}
                    </div>                  
                  </div>
                  <div className="centerAlign">
                    {group.cards && group.cards.map(card => {
                      if (this.state.cardCheck(card)) {
                        return <CardObj card={card} key={card.id} onSelect={this.props.addCard} />
                      }
                      return null;
                    })}
                  </div>
                </Tab>
              );
            })}
          </Tabs>
        </div>
      </div>
    );
  }
}

export default CardSelection;