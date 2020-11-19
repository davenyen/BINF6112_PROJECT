import React, { useState } from 'react';
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

// const apiURL = "http://localhost:5000";

export default function App () {

  const [ processedData, setProcessedData ]  = useState(null);
  const [ selectedRows, setSelectedRows ]  = useState([]);
   
  const handleSubmit = (json) => {
    setProcessedData(json);
  }

  const TableMode = (selected) => {
    if(processedData && processedData.mode === 0) {
      return (
      <div>
        <EpitopeTable 
          data={processedData.epitopesByFile} 
          setSelectedRows={setSelectedRows}
          selectedRows={selectedRows}
        />
        <Table 
          data={processedData.peptides} 
          caption="Peptides" 
          seqWidth={12}
          setSelectedRows={setSelectedRows}
          selectedRows={selectedRows}
        />
        <TableFooter />
      </div>
      );
    }else if (processedData && processedData.mode === 1){
      return (<div>
              <MultTable 
              data={processedData} 
              setSelectedRows={setSelectedRows}
              selectedRows={selectedRows}
              />
              <TableFooter />
              </div>)
    }else{
      return <div></div>
    }
  }

  // Empties the row set
  function handleClick() {
    setSelectedRows([])
  }

  return (
    <div>
      <Navbar />
      <Container>
        <div className="analysis-tabs">
        <Tabs refreshPage={handleSubmit}>
          <div label="Single Sample">
            <UploadForm 
            multiple={0} 
            handleSubmit={handleSubmit} 
            data={processedData}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            />
          </div>
          <div label="Multiple Sample Analysis" onClick={handleClick}>
            <UploadForm 
            multiple={1} 
            handleSubmit={handleSubmit} 
            data={processedData}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            />
          </div>
        </Tabs>
        </div>
        {TableMode()}
      </Container>
    </div>
  );

}
