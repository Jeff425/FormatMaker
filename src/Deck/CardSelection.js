import React, { Component } from 'react';
import OmniSearchbar from './../OmniSearchbar';
import CardObj from './../CardObj';
import ROUTES from './../ROUTES';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';
import Pagination from 'react-bootstrap/Pagination';
import { Link, withRouter } from 'react-router-dom';
import { withHideApp } from './../HideApp';

class CardSelection extends Component {
   
  constructor(props) {
    super(props);
    this.state = {cardCheck: () => {return true;}, page: 1, showInfo: false};
    this.onOmniChange = this.onOmniChange.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }
  
  onOmniChange(checkCard) {
    this.setState({cardCheck: checkCard, page: 1});
  }
  
  onTabChange(key) {
    this.setState({page: 1});
    this.props.onTabChange(key);
  }
  
  render() {      
    return (
      <div className="AppContainer">
        {this.props.children}
        <h1>Card Selection</h1>
        <OmniSearchbar onSearchChange={this.onOmniChange} sortPass={this.props.sortPass} />
        <ButtonGroup className="fullWidth">
          <Button variant="primary" className="flexShare" onClick={() => this.props.history.push(ROUTES.deck)}>Select Another Format</Button>
          <Button variant="info" className="flexShare" onClick={() => this.setState({showInfo: !this.state.showInfo})}>Format Information</Button>
        </ButtonGroup>
        {this.state.showInfo && (<Card className="fullWidth">
          <Card.Body>
            <Card.Title>{this.props.formatName}</Card.Title>
            <div className="card-text">
              <p>{this.props.formatDesc}</p>
              {(this.props.deckMin > 0 || this.props.deckMax > 0 || this.props.sideboardAllowed) && <hr />}
              {(this.props.deckMin > 0 || this.props.deckMax > 0) && (
                <div className="d-flex">
                  {this.props.deckMin > 0 && <div className="mr-auto">{"Deck minimum: " + this.props.deckMin}</div>}
                  {this.props.deckMax > 0 && <div>{"Deck maximum: " + this.props.deckMax}</div>}
                </div>)}
              {this.props.sideboardAllowed && <div className="mt-2 font-weight-bold">Sideboard Allowed</div>}
              {this.props.sideboardAllowed && (this.props.sideMin > 0 || this.props.sideMax > 0) && (
                <div className="d-flex">
                  {this.props.sideMin > 0 && <div className="mr-auto">{"Side minimum: " + this.props.sideMin}</div>}
                  {this.props.sideMax > 0 && <div>{"Side maximum: " + this.props.sideMax}</div>}
                </div>)}
              <div className="d-flex">
                <Link to={ROUTES.formatdetails + "/" + this.props.match.params.formatId} className="mx-auto"><Button>View Full Information</Button></Link>
              </div>
            </div>
          </Card.Body>
        </Card>)}
        <div className="fullWidth mt-1">
          <Tabs activeKey={this.props.tabKey} onSelect={this.onTabChange}>
            {this.props.groups && this.props.groups.map(group => {
              const tabKey = "extra_" + group.groupName;
              const cards = group.cards.filter(this.state.cardCheck);
              const pageCount = Math.ceil(cards.length / 60);
              const pages = [];
              if (pageCount > 0) {
                if (this.state.page > 1) {
                  pages.push(<Pagination.First onClick={() => this.setState({page: 1})} key={-2}/>);
                  pages.push(<Pagination.Prev onClick={() => this.setState({page: this.state.page - 1})} key={-1}/>);
                }
                for(let i = Math.max(1, this.state.page - 2); i < Math.min(pageCount + 1, this.state.page + 3); i++) {
                  pages.push(<Pagination.Item key={i} active={i === this.state.page} onClick={() => this.setState({page: i})}>{i}</Pagination.Item>);
                }
                if (this.state.page < pageCount) {
                  pages.push(<Pagination.Next onClick={() => this.setState({page: this.state.page + 1})} key={pageCount + 1} />);
                  pages.push(<Pagination.Last onClick={() => this.setState({page: pageCount})} key={pageCount + 2} />);
                }
              }
              return (
                <Tab eventKey={tabKey} title={group.groupName} key={tabKey}>                  
                  <div className="bottomExtension">
                    <div className="topTab">
                      <div>
                        Maximum Total: {(group.maxTotal === 0 || group.maxTotal === "0") ? "Unlimited" : group.maxTotal}
                      </div>
                      <div className="right mr-2">
                        Maximum Copies: {(group.maxCopies === 0 || group.maxCopies === "0") ? "Unlimited" : group.maxCopies}
                      </div>     
                    </div>
                    {group.usePointSystem && <div>Maximum Points: {group.maxPoints}</div>}
                  </div>                  
                  {this.props.tabKey === tabKey && (
                    <div className="fullWidth centerAlign">
                      {cards && cards.slice((this.state.page - 1) * 60, this.state.page * 60).map(card => 
                        <CardObj card={card} key={card.id} onSelect={this.props.addCard} onSide={this.props.sideboardAllowed ? card => this.props.addCard(card, true) : null} usePointSystem={group.usePointSystem} />
                      )}
                    </div>)}
                  <div className="d-flex justify-content-center mt-2">
                    <Pagination>{pages}</Pagination>
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

export default withHideApp(withRouter(CardSelection), "Card Selection");