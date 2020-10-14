import React from 'react';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './App.css';
import Nav from './components/Nav.js';

export default function App() {
  return (
    <Router>
      <Switch>
        <Nav />
        <Route path='/home'/>
        <Route path='/results'/>
      </Switch>
    </Router>
  );
}