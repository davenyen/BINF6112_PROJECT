import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './App.css';
import Nav from './components/Nav.js';

export default class App extends Component {
    constructor(props) {
      super(props);
      this.state = { apiResponse: "" };
    } 

  callAPI() {
      fetch("http://localhost:9000/testAPI")
          .then(res => res.text())
          .then(res => this.setState({ apiResponse: res }))
          .catch(err => err);
  }

  componentDidMount() {
      this.callAPI();
  }

  render() {
      return (
          <div className="App">
              <p className="App-intro">{this.state.apiResponse}</p>
          </div>
      );
  }
}

/*
<Switch>
        <Nav />
        <Route path='/home'/>
        <Route path='/results'/>
      </Switch>
*/