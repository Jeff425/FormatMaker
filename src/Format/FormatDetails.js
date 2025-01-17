import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import { Link, withRouter } from 'react-router-dom';
import { withFirebase } from './../Firebase/FirebaseContext';
import ReactMarkdown from 'react-markdown';
import ROUTES from './../ROUTES';
import CommentBox from './CommentBox';

class FormatDetails extends Component {
  
  constructor(props) {
    super(props);
    this.state = {formatData: null, isLoading: true, commentsLoading: true, decksLoading: true, comments: [], displayName: "", commentMessage: "", disablePostComment: false, temporaryFavorite: 0, authUser: null, sendingFavorite: false, newFavorite: null, showReportForm: false, reportReason: "", disableReport: false, reportFeedback: ""};
    this.loadComments = this.loadComments.bind(this);
    this.writeComment = this.writeComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.favoriteFormat = this.favoriteFormat.bind(this);
    this.sendReport = this.sendReport.bind(this);
    this.sendCommentReport = this.sendCommentReport.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.formatdetails + "/" + (this.props.match.params.formatId ? this.props.match.params.formatId : ""));
    this.props.firebase.getFormatMetadata(this.props.match.params.formatId)
    .then(formatDoc => {
      if (formatDoc.exists) {
        this.setState({formatData: formatDoc.data(), isLoading: false});
      }
    });
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (auth.emailVerified) {
          this.setState({authUser: auth});
          this.props.firebase.getUserInfo(auth.uid)
          .then(userInfo => {
            if (userInfo.displayName) {
              this.setState({displayName: userInfo.displayName});
            }
          });
        }
      } else {
        this.setState({authUser: null});
      }
    });
    this.loadComments();
    this.loadDecks();
  }
  
  componentWillUnmount() {
    this.listener();
  }
  
  loadComments() {
    return this.props.firebase.queryComments(this.props.match.params.formatId)
    .then(result => result.docs)
    .then(commentQuery => {
      const comments = commentQuery.filter(doc => doc.exists).map(doc => {
        const comment = {...doc.data()};
        comment.id = doc.id;
        return comment;
      });
      this.setState({commentsLoading: false, comments: comments});
    });
  }
  
  loadDecks() {
    this.props.firebase.queryNewestDecks(this.props.match.params.formatId, 10)
    .then(result => result.docs)
    .then(decks => {
      const decksList = [];
      for (let i = 0; i < decks.length; i += 5) {
        decksList.push(decks.slice(i, i + 5).map(deck => {
          return {name: deck.data().deckName, id: deck.id, authorName: deck.data().authorName};
        }));
      }
      this.setState({decks: decksList, decksLoading: false});
    });    
  }
  
  writeComment(text, commentId = null) {
    this.setState({disablePostComment: true});
    return new Promise((resolve, reject) => {
      this.props.firebase.writeComment(this.props.match.params.formatId, this.state.authUser.uid, this.state.displayName, text, commentId)
      .then(() => {
        // Have to wait four second for the value to be in the collection (and it might not be enough!)
        setTimeout(() => this.loadComments().then(() => {
          this.setState({disablePostComment: false, commentMessage: ""});
          resolve();
        }).catch(reject), 4000);
      }).catch(reject);
    });
  }
  
  deleteComment(commentId) {
    this.props.firebase.deleteComment(this.props.match.params.formatId, commentId)
    .then(() => {
      this.loadComments();
    });
  }
  
  favoriteFormat() {
    this.setState({sendingFavorite: true});
    this.props.firebase.toggleFavoriteFormat(this.props.match.params.formatId).then(result => {
      let currentTemp = this.state.temporaryFavorite;
      currentTemp += result.data.isFavorite ? 1 : -1;
      this.setState({temporaryFavorite: currentTemp, sendingFavorite: false, newFavorite: result.data.isFavorite});
    });
  }
  
  sendReport() {
    this.setState({disableReport: true, showReportForm: false});
    this.props.firebase.reportFormat(this.props.match.params.formatId, this.state.reportReason)
    .then(() => {
      this.setState({reportFeedback: "Report Sent!"});
    })
    .catch(() => {
      this.setState({reportFeedback: "Error Sending Report"});
    });
  }
  
  sendCommentReport(commentId, comment, description) {
    return this.props.firebase.reportComment(this.props.match.params.formatId, commentId, comment, description);
  }
  
  render() {
    if (this.state.isLoading) {
      return (
        <div className="main-page">
          <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
        </div>
      );
    }
    let description = this.state.formatData.description;
    if (this.state.formatData.longDescription) {
      description = <ReactMarkdown source={this.state.formatData.longDescription} linkTarget="_blank" />;
    }
    const favoriteCount = (this.state.formatData.favorites ? this.state.formatData.favorites.length : 0) + this.state.temporaryFavorite;
    let favorite = false;
    if (this.state.newFavorite !== null) {
      favorite = this.state.newFavorite;
    } else if (this.state.authUser && this.state.formatData.favorites) {  
      favorite = this.state.formatData.favorites.includes(this.state.authUser.uid);
    }
    return (
      <Container className="marginTop30px">
        <Row className="px-2">
          <Col>
            <h1 className="pr-1">{this.state.formatData.name}</h1>
            {this.state.formatData.authorName && <Link to={ROUTES.userformat + "/" + this.state.formatData.author} data-toggle="tooltip" title="View this user's formats"><h4 className="text-muted">{this.state.formatData.authorName}</h4></Link>}
          </Col>
          <Col md="auto">
            <div className="d-flex flex-column mb-1">
              <Button variant="danger" onClick={event => this.setState({showReportForm: true})} disabled={this.state.disableReport} className="my-auto">Report Format</Button>
              {this.state.reportFeedback && <div className="text-muted text-center">{this.state.reportFeedback}</div>}
            </div>
            <div className="d-flex flex-column">
              {this.state.authUser && <Button variant="primary" onClick={this.favoriteFormat} disabled={this.state.sendingFavorite}>{favorite ? "Remove Favorite" : "Favorite Format"}</Button>}
              {!this.state.authUser && <Link to={ROUTES.signin + ROUTES.formatdetails +  encodeURIComponent("/") + this.props.match.params.formatId}><Button variant="primary">Sign in to Favorite</Button></Link>}
              <div className="text-muted text-center">{favoriteCount} have favorited</div>
            </div>
          </Col>
        </Row>
        <hr />
        <Row className="px-4 d-block">{description}</Row>
        <Row className="mt-5"><Link to={ROUTES.deck + "/" + this.props.match.params.formatId} onClick={() => window.scrollTo(0, 0)} className="mx-auto"><Button size="lg">Create a Deck for this format</Button></Link></Row>
        
        {!this.state.decksLoading && this.state.decks.length > 0 && <Row className="mt-5 px-2">
          <div className="fullWidth">
            <h3 className="mb-0">Decks <small className="text-muted">Sorted by Newest</small></h3>
            <hr />
            {this.state.decks.map((deckColumn, columnIndex) => {
              return (<Col key={columnIndex}>
                {deckColumn.map((deck, deckIndex) => {
                  return <Row className="align-items-baseline mb-1 h4" key={deckIndex}><div className="mr-2">{(deckIndex + (columnIndex * 5) + 1) + "."}</div><Link to={ROUTES.deckdetails + "/" + this.props.match.params.formatId + "/" + deck.id}>{deck.name}</Link><small className="ml-1 text-muted">{deck.authorName}</small></Row>
                })}
              </Col>);
            })}
          </div>
        </Row>}
        
        {!this.state.commentsLoading && <Row className="mt-5 px-2">
          <div className="fullWidth">
            <h3>Comments <small className="text-muted">{this.state.comments.length} comments</small></h3>
            <hr />
          </div>
          {this.state.displayName && <div className="fullWidth">
            <FormGroup className="mb-1">
              <FormLabel>Enter Message as: {this.state.displayName}</FormLabel>
              <FormControl placeholder="Enter Message" value={this.state.commentMessage} onChange={event => this.setState({commentMessage: event.target.value})} as="textarea" rows="3" maxLength={250} />
            </FormGroup>
            <Button variant="success" disabled={this.state.disablePostComment} onClick={event => this.writeComment(this.state.commentMessage)}>Post Comment</Button>
          </div>}
          {!this.state.displayName && <div>
            <h6>You need to be <Link to={ROUTES.signin + ROUTES.formatdetails + encodeURIComponent("/") + this.props.match.params.formatId}>Signed In</Link>, have your email verified and set your <Link to={ROUTES.accountinfo}>Display Name</Link> in order to comment</h6>
          </div>}
          <div className="fullWidth">
            {this.state.comments.map(comment => (
              <CommentBox key={comment.id} comment={comment} isOwner={this.state.authUser && comment.author === this.state.authUser.uid} onEdit={this.writeComment} onDelete={this.deleteComment} onReport={this.sendCommentReport} />
            ))}
          </div>
        </Row>}
        
        <Modal show={this.state.showReportForm} onHide={event => this.setState({showReportForm: false})}>
          <Modal.Header closeButton>
            <Modal.Title>Report {this.state.formatData.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <FormLabel>What is the reason?</FormLabel>
              <FormControl placeholder="Enter Reason" value={this.state.reportReason} onChange={event => this.setState({reportReason: event.target.value})} as="textarea" rows="5" maxLength={250} />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={this.sendReport}>Send Report</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}

export default withFirebase(withRouter(FormatDetails));