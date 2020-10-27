import React, { Component } from 'react';
import './App.css';
import { Container, Card } from 'reactstrap';
import Navbar from './components/Navbar';
import UploadForm from './components/UploadForm';
import Tabs from "./components/Tabs"; 
import { OutTable } from 'react-excel-renderer';
import Table from './components/Table';

export default class App extends Component {
  constructor(){
    super();
    this.state={
        dataLoaded: false,
        rows: null,
        cols: null,
        processedData: null
    }
  }

  // Passed as a method to child in order for child to update parent state
  // handleSubmit = (dataLoaded, rows, cols, processedData) => {
  //   this.setState({
  //       dataLoaded: dataLoaded,
  //       rows: rows,
  //       cols: cols,
  //       processedData: processedData
  //   })
  // };
  handleSubmit = (processedData) => {
    this.setState({
      processedData: processedData
    });
    console.log(this.state.processedData);
  }

  render() {
    return (
      <div>
        <Navbar />
        <Container>
        <div className="analysis-tabs">
        <Tabs> 
          <div label="Single Sample Analysis"></div> 
          <div label="Multiple Patient Data Analysis"> </div> 
          <div label="Temporal Data Analysis">  </div> 
        </Tabs> 
        </div>
        <UploadForm handleSubmit={this.handleSubmit} />
        {this.state.processedData && <Table data={this.state.processedData} />}
        </Container>
      </div>
    );
  }
}