import React, { Component } from 'react';
import './App.css';
import { Container} from 'reactstrap';
import Navbar from './components/Navbar';
import Tabs from "./components/Tabs"; 
import Table from './components/Table';
import MultTable from './components/MultTable.js';
import UploadForm from './components/UploadForm';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

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
    const TableMode = () => {
      if(this.state.processedData && this.state.processedData.mode === 0) {
        return <Table data={this.state.processedData} />
      }else if (this.state.processedData && this.state.processedData.mode === 1){
        return <MultTable data={this.state.processedData} /> 
      }else if(this.state.processedData && this.state.processedData.mode === 2){
        return <h1>To Do</h1>
      }
    }
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
          {TableMode()}
        </Container>
      </div>
    );
  }
}