import React, { Component } from 'react';
import './App.css';
import { Container} from 'reactstrap';
import Navbar from './components/Navbar';
import Tabs from "./components/Tabs"; 
import Table from './components/Table';
import UploadForm from './components/UploadForm';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
// todo: 
// - convert to hooks 
// - split into different components

// const apiURL = "http://localhost:8000";

export default class App extends Component {
  constructor(){
    super();
    this.state={
        processedData: null
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(json) {
    this.setState({
      processedData: json
    })
  }

  render() {
    return (
      <div>
        <Navbar />
        <Container>
          <div className="analysis-tabs">
          <Tabs> 
            <div label="Single Sample">
              <UploadForm multiple={0} handleSubmit={this.handleSubmit}/>  
            </div> 
            <div label="Multiple Sample Analysis">
              <UploadForm multiple={1} handleSubmit={this.handleSubmit}/>  
            </div> 
            <div label="Temporal Data Analysis">
              <UploadForm multiple={2} handleSubmit={this.handleSubmit}/>  
            </div> 
          </Tabs> 
          </div>
          
          {this.state.processedData && 
            <Table data={this.state.processedData} />
          }
        </Container>
      </div>
    );
  }
}