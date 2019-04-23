import React, { Component } from 'react';
import OmniSearchbar from './../OmniSearchbar';
import CardObj from './../CardObj';
import GroupEditor from './../GroupEditor';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

class FormatEditor extends Component {
   
  constructor(props) {
    super(props);
    this.state = {cardCheck: () => {return true;}, showEdit: false};
    this.onOmniChange = this.onOmniChange.bind(this); 
    this.onEdit = this.onEdit.bind(this);
    this.onSubmitGroupHide = this.onSubmitGroupHide.bind(this);
    this.checkGroupName = this.checkGroupName.bind(this);
  }
  
  onOmniChange(checkCard) {
    this.setState({cardCheck: checkCard});
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
          <Tabs activeKey={this.props.tabKey} onSelect={this.props.onTabChange}>
            {this.props.groups && this.props.groups.map(group => {
              return (
                <Tab eventKey={"extra_" + group.groupName} title={group.groupName} key={"extra_" + group.groupName}>
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
                  <div className="centerAlign">
                    {group.cards && group.cards.map(card => {
                      if (this.state.cardCheck(card)) {
                        return <CardObj card={card} key={card.id} onRemove={this.props.removeCard} />
                      }
                      return null;
                    })}
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