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
  handleSubmit = (dataLoaded, rows, cols, processedData) => {
    this.setState({
        dataLoaded: dataLoaded,
        rows: rows,
        cols: cols,
        processedData: processedData
    })
  };

  render() {
    return (
      <div>
        <Navbar />
        <Container>
        <div className="analysis-tabs">
        <h2>Plase choose your analysis modes</h2>
        <Tabs> 
          <div label="Single Sample"> 
            Single Sample
          </div> 
          <div label="Compare multiple samples"> 
            Compare multiple samples
          </div> 
          <div label="Temporal Data Analysis"> 
            Temporal Data Analysis
          </div> 
        </Tabs> 
        </div>
        <UploadForm 
          className="xlsx/gpr-form" 
          fileTypeOne="xlsx" 
          fileTypeTwo="gpr"
          warningOne="Please select a .xlsx/.gpr file only!" 
          warningTwo="Maximum of 2 data files allowed!"
          handleSubmit={this.handleSubmit}
        />
        <UploadForm 
          className="pdb-form" 
          fileTypeOne="pdb" 
          fileTypeTwo=""
          warningOne="Please select a pdb file only!" 
          warningTwo="Only 1 pdb file allowed!"
        />
        {this.state.dataLoaded && 
        <div className="output-table">
          <Card body outline color="secondary" className="restrict-card">
              <OutTable 
                data={this.state.rows} 
                columns={this.state.cols} 
                tableClassName="ExcelTable2007" 
                tableHeaderRowClass="heading" 
              />
          </Card>  
        </div>}
        {this.state.processedData && <Table data={this.state.processedData} />}
        </Container>
      </div>
    );
  }
}