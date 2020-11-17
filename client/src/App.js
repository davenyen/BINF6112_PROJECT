import React, { useEffect, useState } from 'react';
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

export default function App() {
  
  const [ processedData, setProcessedData ] = useState(null)

  const handleSubmit = (json) => {
    setProcessedData(json);
  }

  const TableMode = () => {
    if(processedData && processedData.mode === 0) {
      return (<div>
        <EpitopeTable data={processedData.epitopesByFile} />
        <Table data={processedData.peptides} caption="Peptides" seqWidth={12}/>
      </div>
      );
    }else if (processedData && processedData.mode === 1){
      return <MultTable data={processedData} />
    }else if(processedData && processedData.mode === 2){
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
            <UploadForm multiple={0} handleSubmit={handleSubmit} data={processedData}/>
          </div>
          <div label="Multiple Sample Analysis">
            <UploadForm multiple={1} handleSubmit={handleSubmit} data={processedData}/>
          </div>
          <div label="Temporal Data Analysis">
            <UploadForm multiple={2} handleSubmit={handleSubmit} data={processedData}/>
          </div>
        </Tabs>
        </div>
        {TableMode}
        {processedData && <TableFooter />}
      </Container>
    </div>
  );

}