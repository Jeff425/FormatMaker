import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import ROUTES from './../ROUTES';
import { withFirebase } from './../Firebase/FirebaseContext';

class Reports extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formatReports: [], isLoadingComments: true, commentReports: [], isLoadingDecks: true, deckReports: []};
    this.ignoreReport = this.ignoreReport.bind(this);
    this.deleteFormat = this.deleteFormat.bind(this);
    this.ignoreCommentReport = this.ignoreCommentReport.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.ignoreDeckReport = this.ignoreDeckReport.bind(this);
    this.deleteDeck = this.deleteDeck.bind(this);
  }
  
  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        this.props.firebase.queryFormatReports(true)
        .then(result => result.docs)
        .then(reportQuery => {
          const reports = reportQuery.filter(doc => doc.exists).map(doc => {
            const report = {...doc.data()};
            report.id = doc.id;
            return report;
          });
          this.setState({isLoading: false, formatReports: reports});
        });
        this.props.firebase.queryCommentReports(true)
        .then(result => result.docs)
        .then(reportQuery => {
          const reports = reportQuery.filter(doc => doc.exists).map(doc => {
            const report = {...doc.data()};
            report.id = doc.id;
            return report;
          });
          this.setState({isLoadingComments: false, commentReports: reports});
        });
        this.props.firebase.queryDeckReports(true)
        .then(result => result.docs)
        .then(reportQuery => {
          const reports = reportQuery.filter(doc => doc.exists).map(doc => {
            const report = {...doc.data()};
            report.id = doc.id;
            return report;
          });
          this.setState({isLoadingDecks: false, deckReports: reports});
        });
      }
    });
  }
  
  componentWillUnmount() {
    this.listener();
  }
  
  ignoreReport(reportId) {
    this.setState({formatReports: this.state.formatReports.filter(report => report.id !== reportId)});
    this.props.firebase.ignoreReport(reportId);
  }
  
  deleteFormat(reportId, formatId, banUser) {
    this.setState({formatReports: this.state.formatReports.filter(report => report.id !== reportId)});
    this.props.firebase.deleteFormatAdmin(reportId, formatId, banUser);
  }
  
  ignoreCommentReport(reportId) {
    this.setState({commentReports: this.state.commentReports.filter(report => report.id !== reportId)});
    this.props.firebase.ignoreCommentReport(reportId);
  }
  
  deleteComment(reportId, formatId, commentId, banUser) {
    this.setState({commentReports: this.state.commentReports.filter(report => report.id !== reportId)});
    this.props.firebase.deleteCommentAdmin(reportId, formatId, commentId, banUser);
  }
  
  ignoreDeckReport(reportId) {
    this.setState({deckReports: this.state.deckReports.filter(report => report.id !== reportId)});
    this.props.firebase.ignoreDeckReport(reportId);
  }
  
  deleteDeck(reportId, formatId, deckId, banUser) {
    this.setState({deckReports: this.state.deckReports.filter(report => report.id !== reportId)});
    this.props.firebase.deleteDeckAdmin(reportId, formatId, deckId, banUser);
  }
  
  render() {
    if (this.state.isLoading || this.state.isLoadingComments) {
      return (
        <div className="main-page">
          <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
        </div>
      );
    }
    return (
      <div className="AppContainer fullWidth">
        <div className="d-flex flex-row flex-wrap">
        {this.state.formatReports.map(report => (
          <Card key={report.id} className="reportCard ml-3 mr-3 mt-3">
            <Card.Body className="d-flex flex-column">
              <Link to={ROUTES.formatdetails + "/" + report.formatId} target="_blank"><Card.Title>Format {report.formatId}</Card.Title></Link>
              <Card.Text>{report.description}</Card.Text>
              <div className="d-flex justify-content-between mt-auto align-items-center">
                <Button variant="link" onClick={event => this.ignoreReport(report.id)}>Ignore Report</Button>
                <Button variant="link" onClick={event => this.deleteFormat(report.id, report.formatId, false)}>Delete Format</Button>
                <Button variant="link" onClick={event => this.deleteFormat(report.id, report.formatId, true)}>Ban User</Button>
              </div>
            </Card.Body>
          </Card>
        ))}
        </div>
        <div className="d-flex flex-row flex-wrap">
        {this.state.commentReports.map(report => (
          <Card key={report.id} className="reportCard ml-3 mr-3 mt-3">
            <Card.Body className="d-flex flex-column">
              <Link to={ROUTES.formatdetails + "/" + report.formatId} target="_blank"><Card.Title>Format {report.formatId}</Card.Title></Link>
              <Card.Text>{report.description}</Card.Text>
              <div className="text-muted">Comment:</div>
              <div>{report.comment}</div>
              <div className="d-flex justify-content-between mt-auto align-items-center">
                <Button variant="link" onClick={event => this.ignoreCommentReport(report.id)}>Ignore Report</Button>
                <Button variant="link" onClick={event => this.deleteComment(report.id, report.formatId, report.commentId, false)}>Delete Comment</Button>
                <Button variant="link" onClick={event => this.deleteComment(report.id, report.formatId, report.commentId, true)}>Ban User</Button>
              </div>
            </Card.Body>
          </Card>
        ))}
        </div>
        <div className="d-flex flex-row flex-wrap">
        {this.state.deckReports.map(report => (
          <Card key={report.id} className="reportCard ml-3 mr-3 mt-3">
            <Card.Body className="d-flex flex-column">
              <Link to={ROUTES.deckdetails + "/" + report.formatId + "/" + report.deckId} target="_blank"><Card.Title>Deck {report.deckId}</Card.Title></Link>
              <Card.Text>{report.description}</Card.Text>
              <div className="d-flex justify-content-between mt-auto align-items-center">
                <Button variant="link" onClick={event => this.ignoreDeckReport(report.id)}>Ignore Report</Button>
                <Button variant="link" onClick={event => this.deleteDeck(report.id, report.formatId, report.deckId, false)}>Delete Deck</Button>
                <Button variant="link" onClick={event => this.deleteDeck(report.id, report.formatId, report.deckId, true)}>Ban User</Button>
              </div>
            </Card.Body>
          </Card>
        ))}
        </div>
      </div>
    );
  }
}

export default withFirebase(Reports);