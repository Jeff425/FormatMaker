import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import ROUTES from './../ROUTES';
import { withFirebase } from './../Firebase/FirebaseContext';

class Reports extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formatReports: []}
    this.ignoreReport = this.ignoreReport.bind(this);
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
  
  render() {
    if (this.state.isLoading) {
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
      </div>
    );
  }
}

export default withFirebase(Reports);