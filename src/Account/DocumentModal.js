import React, { Component } from 'react';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

class DocumentModal extends Component {
  render() {
    return (
      <Modal show={this.props.showModal} onHide={this.props.hideModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{this.props.modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body><FormControl readOnly as="textarea" rows="20" className="textAreaModal" value={this.props.modalBody} /></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.hideModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DocumentModal;