import React, { Component } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MainPage from './MainPage';
import NavigationBar from './NavigationBar';
import FormatBuilder from './Format/FormatBuilder';
import DeckBuilder from './Deck/DeckBuilder';
import SignInPage from './Account/SignInPage';
import SignUpPage from './Account/SignUpPage';
import FormatSelector from './Format/FormatSelector';
import OwnFormatSelector from './Format/OwnFormatSelector';
import HowToUse from './HowToUse';
import { withFirebase } from './Firebase/FirebaseContext';

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {authUser: null};
  }
  
  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      authUser ? this.setState({authUser: authUser}) : this.setState({authUser: null});
    });
  }
  
  componentWillUnmount() {
    this.listener();
  }
  
  render() {
    return (
      <Router>
        <div className="viewport">
          <NavigationBar authUser={this.state.authUser} />
          <div className="content">
            <Route exact={true} path="/" component={MainPage} />
            <Route path="/format/:formatId?" component={FormatBuilder} />
            <Route path="/deck/:formatId" component={DeckBuilder} />
            <Route exact={true} path="/deck" component={FormatSelector} />
            <Route path="/signin/:redirect?" component={SignInPage} />
            <Route path="/signup/:redirect?" component={SignUpPage} />
            <Route path="/ownformats" component={OwnFormatSelector} />
            <Route path="/howto" component={HowToUse} />
          </div>
        </div>
      </Router>
    );
  }
}

export default withFirebase(App);
