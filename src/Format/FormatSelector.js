import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { withFirebase } from './../Firebase/FirebaseContext';
import ROUTES from './../ROUTES';
import FormatCard from './FormatCard';

const sortingMethods = ["Latest Update", "Newest", "Most Favorites"];

class FormatSelector extends Component {
  
  constructor(props) {
    super(props);
    this.state = {isLoading: true, formats: [], isAuthed: false, isLoadingSponsored: true, sponsoredFormats: [], authorNames: {}, sortMethod: 0, dropdownDisabled: false};
    this.onDropDownSelect = this.onDropDownSelect.bind(this);
  }
  
  componentDidMount() {
    ReactGA.pageview(ROUTES.deck);
    this.props.firebase.queryFormats()
    .then(result => result.docs)
    .then(formatQuery => {
      const formats = formatQuery.filter(doc => doc.exists).map(doc => {
        const format = {...doc.data()};
        format.id = doc.id;
        return format;
      });
      this.setState({formats: formats, isLoading: false});
    });
    this.props.firebase.querySponsoredFormats()
    .then(result => result.docs)
    .then(formatQuery => {
      const formats = formatQuery.filter(doc => doc.exists).map(doc => {
        const format = {...doc.data()};
        format.id = doc.id;
        return format;
      });
      this.setState({isLoadingSponsored: false, sponsoredFormats: formats});
    });
    this.listener = this.props.firebase.auth.onAuthStateChanged(auth => {
      if (auth) {
        if (auth.emailVerified) {
          this.setState({isAuthed: true});
        }
      }
    });
  }
  
  componentWillUnmount() {
    this.listener();
  }
  
  onDropDownSelect(newSortMethod) {
    const sortFunctions = [this.props.firebase.queryFormats, this.props.firebase.queryNewestFormats, this.props.firebase.queryMostFavoritedFormats];
    this.setState({dropdownDisabled: true});
    sortFunctions[newSortMethod]()
    .then(result => result.docs)
    .then(formatQuery => {
      const formats = formatQuery.filter(doc => doc.exists).map(doc => {
        const format = {...doc.data()};
        format.id = doc.id;
        return format;
      });
      this.setState({formats: formats, dropdownDisabled: false, sortMethod: newSortMethod});
    });
  }
  
  render() {
    if (this.state.isLoading || this.state.isLoadingSponsored) {
      return (
        <div className="main-page">
          <img className="mt-4" src={process.env.PUBLIC_URL + "/loader.gif"} alt="loading" />
        </div>
      );
    }
    return (
      <div className="AppContainer fullWidth">
        <h1>Select a format</h1>
        {this.state.isAuthed && <h4>You may view your own formats <Link to={ROUTES.ownformat}>here</Link></h4>}
        <h3 className="mt-2 mb-0 ml-4 fullWidth">FormatBuilder's Favorites</h3>
        <hr className="fullWidth my-1" />
        <div className="d-flex flex-row flex-wrap fullWidth">
        {this.state.sponsoredFormats.map(format => (
          <FormatCard format={format} key={format.id} />
        ))}
        </div>
        <div className="d-flex mt-4 fullWidth">
          <h3 className="mb-0 ml-4 mr-3">Viewing Formats By</h3>
          <DropdownButton title={sortingMethods[this.state.sortMethod]} disabled={this.state.dropdownDisabled}>
            {this.state.sortMethod !== 0 && <Dropdown.Item onSelect={event => this.onDropDownSelect(0)}>{sortingMethods[0]}</Dropdown.Item>}
            {this.state.sortMethod !== 1 && <Dropdown.Item onSelect={event => this.onDropDownSelect(1)}>{sortingMethods[1]}</Dropdown.Item>}
            {this.state.sortMethod !== 2 && <Dropdown.Item onSelect={event => this.onDropDownSelect(2)}>{sortingMethods[2]}</Dropdown.Item>}
          </DropdownButton>
        </div>
        <hr className="fullWidth my-1" />
        <div className="d-flex flex-row flex-wrap fullWidth">
        {this.state.formats.map(format => (
          <FormatCard format={format} key={format.id} />
        ))}
        </div>
      </div>
    );
  }
}

export default withFirebase(FormatSelector);