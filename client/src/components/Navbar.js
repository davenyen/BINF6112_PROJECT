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
              <h1 className="title">Microarray Project</h1>
              <p className="title-description">Welcome to the platform of Microarray Data Analysis.</p>  
              <hr className="my-2" />
              <p>Developed with <span className="fa fa-heart"></span> by Team Lee</p>
          </Jumbotron>
        </div>
    )
}