import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { Link, NavLink } from 'react-router-dom';
import { withFirebase } from './Firebase/FirebaseContext';
import ROUTES from './ROUTES';

class NavigationBar extends Component {
  
  constructor(props) {
    super(props);
    this.state = {expanded: false};
    this.onNavigation = this.onNavigation.bind(this);
    this.onSignOut = this.onSignOut.bind(this);
  }
  
  onNavigation() {
    this.setState({expanded: false});
    window.scrollTo(0, 0);
  }
  
  onSignOut() {
    this.onNavigation();
    this.props.firebase.signOut();
  }
  
  render() {
    return (
      <Navbar variant="dark" bg="primary" expand="lg" fixed="top" expanded={this.state.expanded} onToggle={() => this.setState({expanded: !this.state.expanded})}>
        <Navbar.Brand as={Link} to="/" onClick={this.onNavigation}><img alt="" src={process.env.PUBLIC_URL + "/favicon.ico"} width="32" height="32" className="d-inline-block align-top mr-2" /><span className="d-inline-block nav-brand-margin">FormatBuilder</span></Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse id="navbarCollapse">
          <Nav>
            <Nav.Link as={NavLink} to={ROUTES.format} onClick={this.onNavigation}>Create Format</Nav.Link>
            <Nav.Link as={NavLink} to={ROUTES.deck} onClick={this.onNavigation}>Build Deck</Nav.Link>
            <Nav.Link as={NavLink} to={ROUTES.howto} onClick={this.onNavigation}>How To Use</Nav.Link>
            <Nav.Link as={NavLink} to={ROUTES.changelog} onClick={this.onNavigation}>Changelog</Nav.Link>
          </Nav>
          <Nav className="ml-auto">
            {this.props.authUser &&
              <Nav.Link as={NavLink} to={ROUTES.ownformat} onClick={this.onNavigation}>Your Formats</Nav.Link>
            }
            {this.props.authUser &&
              <Nav.Link as={NavLink} to={ROUTES.accountinfo} onClick={this.onNavigation}>Account</Nav.Link>
            }
            {this.props.authUser &&
              <Button variant="link" className="nav-link border-0" onClick={this.onSignOut}>Sign Out</Button>        
            }
            {!this.props.authUser && <Nav.Link as={NavLink} to={ROUTES.signin} onClick={this.onNavigation}>Sign In</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default withFirebase(NavigationBar);