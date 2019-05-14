import React, { Component } from 'react';
import OmniSearchbar from './../OmniSearchbar';
import CardObj from './../CardObj';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Pagination from 'react-bootstrap/Pagination';
import { Link } from 'react-router-dom';
import { withHideApp } from './../HideApp';

class CardSelection extends Component {
   
  constructor(props) {
    super(props);
    this.state = {cardCheck: () => {return true;}, page: 1};
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
        <Link to="/deck" className="fullWidth">
          <Button variant="primary" className="fullWidth">Select Another Format</Button>
        </Link>
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
                  <div className="bottomExtension topTab">
                    <div>
                      Maximum Total: {(group.maxTotal === 0 || group.maxTotal === "0") ? "Unlimited" : group.maxTotal}
                    </div>
                    <div className="right mr-2">
                      Maximum Copies: {(group.maxCopies === 0 || group.maxCopies === "0") ? "Unlimited" : group.maxCopies}
                    </div>                  
                  </div>                  
                  {this.props.tabKey === tabKey && (
                    <div className="centerAlign">
                      {cards && cards.slice((this.state.page - 1) * 60, this.state.page * 60).map(card => 
                        <CardObj card={card} key={card.id} onSelect={this.props.addCard} onSide={card => this.props.addCard(card, true)} />
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

export default withHideApp(CardSelection, "Card Selection");