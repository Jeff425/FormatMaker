import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { privacyTitle, privacyBody } from './Account/PrivacyPolicy';
import DocumentModal from './Account/DocumentModal';

class Footer extends Component {
  
  constructor(props) {
    super(props);
    this.state = {showModal: false, modalTitle: privacyTitle, modalBody: privacyBody};
  }
  
  render() {
    return (
      <footer className="bg-primary">
        <Container className="mt-3 mb-3">        
          <ul className="d-inline-block mx-auto">
            <li><Button variant="link" onClick={() => window.scrollTo(0, 0)}>Back to top</Button></li>
            <li><ReactGA.OutboundLink eventLabel="paypal donation" to="https://www.paypal.me/khalorlstudiosllc" target="_blank">Support FormatMaker</ReactGA.OutboundLink></li>
            <li><ReactGA.OutboundLink eventLabel="contact email" to="mailto:contact@khalorlstudios.com?subject=FormatBuilder Question" target="_blank">Contact KhalorlStudios</ReactGA.OutboundLink></li>
            <li><ReactGA.OutboundLink eventLabel="discord" to="https://discord.gg/S368yWs" target="_blank">Discord Channel</ReactGA.OutboundLink></li>
            <li><Button variant="link" onClick={() => this.setState({showModal: true})}>Privacy Policy</Button></li>
            <li><ReactGA.OutboundLink eventLabel="khalorlstudios link" to="http://khalorlstudios.com/" target="_blank">Visit KhalorlStudios</ReactGA.OutboundLink></li>          
          </ul>
          <ul className="text-secondary mt-2 copyright">
            <li>The literal and graphical information presented on this site about Magic: The Gathering, including card images, the mana symbols, and Oracle text, is copyright Wizards of the Coast, LLC, a subsidiary of Hasbro, Inc. This website is not produced by, endorsed by, supported by, or affiliated with Wizards of the Coast.</li>
            <li>The Scryfall name is copyright of Scryfall, LLC. FormatMaker is not produced, supported, or endorsed by this service.</li>
            <li>Card prices are estimates and absolutely no guarantee is made for any price information. See stores for final prices.</li>
            <li>All other content © KhalorlStudios, LLC.</li>
          </ul>
        </Container>
        <DocumentModal showModal={this.state.showModal} hideModal={() => this.setState({showModal: false})} modalTitle={this.state.modalTitle} modalBody={this.state.modalBody} />
      </footer>
    );
  }
}

export default Footer;