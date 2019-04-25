import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { Link, NavLink } from 'react-router-dom';
import FirebaseContext from './Firebase/FirebaseContext';
import ROUTES from './ROUTES';

class NavigationBar extends Component {
  render() {
    return (
      <Navbar variant="dark" bg="primary" expand="lg" fixed="top">
        <Navbar.Brand as={Link} to="/">FormatMaker</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse id="navbarCollapse">
          <Nav>
            <Nav.Link as={NavLink} to={ROUTES.format}>Create Format</Nav.Link>
            <Nav.Link as={NavLink} to={ROUTES.deck}>Build Deck</Nav.Link>
            <Nav.Link as={NavLink} to={ROUTES.howto}>How To Use</Nav.Link>
          </Nav>
          <Nav className="ml-auto">
            {this.props.authUser &&
              <Nav.Link as={NavLink} to={ROUTES.ownformat}>Your Formats</Nav.Link>
            }
            {this.props.authUser &&
              <FirebaseContext.Consumer>
                {firebase => <Button variant="link" className="nav-link border-0" onClick={firebase.signOut}>Sign Out</Button>}             
              </FirebaseContext.Consumer>
            }
            {!this.props.authUser && <Nav.Link as={NavLink} to={ROUTES.signin}>Sign In</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default NavigationBar;