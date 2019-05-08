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
    this.onSignOut = this.onSignOut.bind(this);
  }
  
  onSignOut() {
    this.setState({expanded: false});
    this.props.firebase.signOut();
  }
  
  render() {
    return (
      <Navbar variant="dark" bg="primary" expand="lg" fixed="top" expanded={this.state.expanded} onToggle={() => this.setState({expanded: !this.state.expanded})}>
        <Navbar.Brand as={Link} to="/" onClick={() => this.setState({expanded: false})}>FormatMaker</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse id="navbarCollapse">
          <Nav>
            <Nav.Link as={NavLink} to={ROUTES.format} onClick={() => this.setState({expanded: false})}>Create Format</Nav.Link>
            <Nav.Link as={NavLink} to={ROUTES.deck} onClick={() => this.setState({expanded: false})}>Build Deck</Nav.Link>
            <Nav.Link as={NavLink} to={ROUTES.howto} onClick={() => this.setState({expanded: false})}>How To Use</Nav.Link>
          </Nav>
          <Nav className="ml-auto">
            {this.props.authUser &&
              <Nav.Link as={NavLink} to={ROUTES.ownformat} onClick={() => this.setState({expanded: false})}>Your Formats</Nav.Link>
            }
            {this.props.authUser &&
                <Button variant="link" className="nav-link border-0" onClick={this.onSignOut}>Sign Out</Button>        
            }
            {!this.props.authUser && <Nav.Link as={NavLink} to={ROUTES.signin}>Sign In</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default withFirebase(NavigationBar);