import React from 'react';
import { BrowserRouter as Route, Link } from 'react-router-dom';
import './App.css';
import Nav from './components/Nav.js';

export default function App() {
  return (
    <Route>
      <Nav />
    </Route>
  );
}