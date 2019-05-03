import React, { Component } from 'react';
import OmniSearchbar from './../OmniSearchbar';
import CardObj from './../CardObj';
import GroupEditor from './../GroupEditor';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Pagination from 'react-bootstrap/Pagination';

class FormatEditor extends Component {
   
  constructor(props) {
    super(props);
    this.state = {cardCheck: () => {return true;}, showEdit: false, page: 1};
    this.onOmniChange = this.onOmniChange.bind(this); 
    this.onEdit = this.onEdit.bind(this);
    this.onSubmitGroupHide = this.onSubmitGroupHide.bind(this);
    this.checkGroupName = this.checkGroupName.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }
  
  onOmniChange(checkCard) {
    this.setState({cardCheck: checkCard, page: 1});
  }
  
  onEdit() {
    this.setState({showEdit: !this.state.showEdit});
  }
  
  onSubmitGroupHide(groupName, maxTotal, maxCopies) {
    this.onEdit();
    this.props.onSubmitGroup(groupName, maxTotal, maxCopies);
  }
  
  checkGroupName(name) {
    if (!this.props.groups) {
      return true;
    }
    for (let i = 0; i < this.props.groups.length; i++) {
      if (this.props.groups[i].groupName === name) {
        return false;
      }
    }
    return true;
  }
  
  onTabChange(key) {
    this.setState({page: 1});
    this.props.onTabChange(key);
  }
  
  // <input type="file" ref="formatLoader" className="hidden" onChange={this.props.onLoad} accept=".format" />
  // <Button variant="primary" onClick={() => this.refs.formatLoader.click()}>Load</Button>
  render() {  
    return (
      <div className="AppContainer">
        
        <h1>Format Editor</h1>
        <OmniSearchbar onSearchChange={this.onOmniChange} sortPass={this.props.sortPass} />
        <ButtonGroup className="fullWidth mb-3">
          <Button variant="primary" className="flexShare" onClick={this.props.onSave}>Submit</Button>
          <Button variant="primary" className="flexShare" onClick={this.props.onInfo}>Info</Button>
        </ButtonGroup>
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
                  {this.state.showEdit && (
                    <GroupEditor onSubmitGroup={this.onSubmitGroupHide} onDeleteGroup={this.props.onDeleteGroup} groupName={group.groupName} maxTotal={group.maxTotal} maxCopies={group.maxCopies} />
                  )}
                  {!this.state.showEdit && (
                    <div className="bottomExtension topTab">
                      <div>
                        Maximum Total: {(group.maxTotal === 0 || group.maxTotal === "0") ? "Unlimited" : group.maxTotal}
                      </div>
                      <div className="right mr-2">
                        Maximum Copies: {(group.maxCopies === 0 || group.maxCopies === "0") ? "Unlimited" : group.maxCopies}
                      </div>                  
                      <Button variant="primary" onClick={this.onEdit}>Edit</Button>
                    </div>
                  )}
                  {this.props.tabKey === tabKey && (
                    <div className="centerAlign">
                      {cards && cards.slice((this.state.page - 1) * 60, this.state.page * 60).map(card =>
                        <CardObj card={card} key={card.id} onRemove={this.props.removeCard} />
                      )}
                    </div>)}
                  <div className="d-flex justify-content-center mt-2">
                    <Pagination size="lg">{pages}</Pagination>
                  </div>
                </Tab>
              );
            })}
            <Tab eventKey="addGroup" title="Add Group">
              <GroupEditor onSubmitGroup={this.props.onSubmitGroup} checkName={this.checkGroupName} />
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default FormatEditor;