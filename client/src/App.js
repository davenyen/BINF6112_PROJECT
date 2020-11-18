import React, { Component } from 'react';
import './App.css';
import { Container} from 'reactstrap';
import Navbar from './components/Navbar';
import Tabs from "./components/Tabs";
import Table from './components/Table';
import TableFooter from './components/TableFooter';
import MultTable from './components/MultTable.js';
import UploadForm from './components/UploadForm';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import EpitopeTable from './components/EpitopeTable';

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
        return (<div>
          <EpitopeTable data={this.state.processedData.epitopesByFile} />
          
          <Table data={this.state.processedData.peptides} caption="Peptides" seqWidth={12}/>
          <TableFooter />
        </div>
        );
      }else if (this.state.processedData && this.state.processedData.mode === 1){
        return (<div>
                <MultTable data={this.state.processedData} />
                <TableFooter />
                </div>)
      }else{
        return <div></div>
      }
    }
    return (
      <div>
        <Navbar />
        <Container>
          <div className="analysis-tabs">
          <Tabs
            refreshPage={this.handleSubmit}
          >
            <div label="Single Sample">
              <UploadForm multiple={0} handleSubmit={this.handleSubmit} data={this.state.processedData}/>
            </div>
            <div label="Multiple Sample Analysis">
              <UploadForm multiple={1} handleSubmit={this.handleSubmit} data={this.state.processedData}/>
            </div>
          </Tabs>
          </div>
          {TableMode()}
        </Container>
      </div>
    );
  }
}