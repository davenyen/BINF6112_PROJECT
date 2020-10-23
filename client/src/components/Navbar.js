import React from 'react';
//import { Link } from 'react-router-dom';
import { Jumbotron } from 'reactstrap';

// todo: 
// - create Navbar.css
// - use links
// - create navbar-items

export default function Navbar() {
    return (
        <div className="nav-bar">
          <Jumbotron className="jumbotron-background">          
              <h1 className="title">Epitope Microarray Analysis Platform</h1>
              <p className="title-description">Integrating structural information with microarray data analysis.</p>  
              <hr className="my-2" />
              <p>Developed by Team Lee 2020</p>
          </Jumbotron>
        </div>
    )
}