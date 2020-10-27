import React, { Component } from 'react';
import './App.css';
import { Container} from 'reactstrap';
import Navbar from './components/Navbar';
import UploadForm from './components/UploadForm';
import Tabs from "./components/Tabs"; 
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
    this.handleSubmit = this.handleSubmit.bind(this);
  }

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