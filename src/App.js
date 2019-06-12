import React, { Component } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MainPage from './MainPage';
import NavigationBar from './NavigationBar';
import FormatBuilder from './Format/FormatBuilder';
import FormatDetails from './Format/FormatDetails';
import DeckBuilder from './Deck/DeckBuilder';
import SignInPage from './Account/SignInPage';
import SignUpPage from './Account/SignUpPage';
import PasswordForget from './Account/PasswordForget';
import PasswordChange from './Account/PasswordChange';
import EmailVerify from './Account/EmailVerify';
import FormatSelector from './Format/FormatSelector';
import OwnFormatSelector from './Format/OwnFormatSelector';
import UserFormatSelector from './Format/UserFormatSelector';
import FavoriteFormats from './Format/FavoriteFormats';
import HowToUse from './HowToUse';
import Changelog from './Changelog';
import AccountInfo from './Account/AccountInfo';
import Reports from './Admin/Reports';
import ROUTES from './ROUTES';
import Footer from './Footer';

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {authUser: null};
  }
  
  render() {
    return (
      <Router>
        <div className="viewport">
          <NavigationBar />
          <div className="content">
            <Route exact={true} path="/" component={MainPage} />
            <Route path={ROUTES.formatdetails + "/:formatId"} component={FormatDetails} />
            <Route path={ROUTES.format + "/:formatId?"} component={FormatBuilder} />
            <Route path={ROUTES.deck + "/:formatId"} component={DeckBuilder} />
            <Route exact={true} path={ROUTES.deck} component={FormatSelector} />
            <Route path={ROUTES.signin + "/:redirect?"} component={SignInPage} />
            <Route path={ROUTES.signup} component={SignUpPage} />
            <Route path={ROUTES.ownformat} component={OwnFormatSelector} />
            <Route path={ROUTES.howto} component={HowToUse} />
            <Route path={ROUTES.passwordforget} component={PasswordForget} />
            <Route path={ROUTES.passwordchange} component={PasswordChange} />
            <Route path={ROUTES.emailverify} component={EmailVerify} />
            <Route path={ROUTES.changelog} component={Changelog} />
            <Route path={ROUTES.accountinfo} component={AccountInfo} />
            <Route path={ROUTES.userformat + "/:userId"} component={UserFormatSelector} />
            <Route path={ROUTES.favorites} component={FavoriteFormats} />
            <Route path={ROUTES.reports} component={Reports} />
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
