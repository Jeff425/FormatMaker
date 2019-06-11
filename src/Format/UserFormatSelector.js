import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import FormatCard from './FormatCard';

class UserFormatSelector extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formats: [], authorName: ""};
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.userformat + "/" + this.props.match.params.userId);
    this.props.firebase.getUserInfo(this.props.match.params.userId)
    .then(userInfo => {
      if (!userInfo.notFound) {
        this.setState({authorName: userInfo.displayName});
      }
      this.props.firebase.queryFormats({uid: this.props.match.params.userId})
      .then(result => result.docs)
      .then(formatQuery => {
        const formats = formatQuery.filter(doc => doc.exists).map(doc => {
          const format = {...doc.data()};
          format.id = doc.id;
          return format;
        });
        this.setState({isLoading: false, formats: formats});
      });
    });
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
        <h1>Viewing {this.state.authorName}'s formats</h1>
        <div className="d-flex flex-row flex-wrap">
        {this.state.formats.map(format => (
          <FormatCard format={format} key={format.id} />
        ))}
        </div>
      </div>
    );
  }
};

export default withFirebase(UserFormatSelector);