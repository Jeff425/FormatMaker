import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

class Footer extends Component {
  render() {
    return (
      <footer className="bg-primary">
        <Container className="mt-3 mb-3 text-center">        
          <ul className="d-inline-block mx-auto">
            <li><Button variant="link" onClick={() => window.scrollTo(0, 0)}>Back to top</Button></li>
            <li><a href="https://www.paypal.me/khalorlstudios" target="_blank">Support FormatMaker</a></li>
            <li><a href="mailto:khalorlstudios@gmail.com?subject=FormatMaker Question">Contact KhalorlStudios</a></li>
            <li><a href="http://khalorlstudios.com/">Visit KhalorlStudios</a></li>          
          </ul>
          <ul className="text-secondary mt-2 copyright">
            <li>The literal and graphical information presented on this site about Magic: The Gathering, including card images, the mana symbols, and Oracle text, is copyright Wizards of the Coast, LLC, a subsidiary of Hasbro, Inc. This website is not produced by, endorsed by, supported by, or affiliated with Wizards of the Coast.</li>
            <li>The Scryfall name is copyright of Scryfall, LLC. FormatMaker is not produced, supported, or endorsed by this service</li>
            <li>All other content © KhalorlStudios, LLC.</li>
          </ul>
        </Container>
      </footer>
    );
  }
}

export default Footer;