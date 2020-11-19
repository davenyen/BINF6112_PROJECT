import React, { useState, useEffect } from 'react';
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
import { Stage } from 'ngl'
import { NGL } from 'react-ngl'

// const apiURL = "http://localhost:5000";

export default function App () {

  const [ processedData, setProcessedData ]  = useState(null);
  const [ selectedRows, setSelectedRows ]  = useState([]);
  const [ stage, setStage ] = useState(null);
  const [ pdbFile, setFile ] = useState(null);
  const [ tmpX, setTmpX ] = useState(0);
   
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
          stage={stage}
          setStage={setStage}
        />
        <Table 
          data={processedData.peptides} 
          caption="Peptides" 
          seqWidth={12}
          setSelectedRows={setSelectedRows}
          selectedRows={selectedRows}
          stage={stage}
          setStage={setStage}
        />
        <TableFooter />
      </div>
      );
    }else if (processedData && processedData.mode === 1){
      return (<div>
              <MultTable data={processedData} />
              <TableFooter />
              </div>)
    }else{
      return <div></div>
    }
  }

  const renderRows = () => {
    if (selectedRows.length > 0) {
      setTmpX(tmpX + 1);
    }
    return (
      <div>
        {selectedRows}
        {console.log(selectedRows)}
      </div>
    )
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
            pdbSelections={selectedRows}
            stage={stage}
            setStage={setStage}
            setFile={setFile}
            />
          </div>
          <div label="Multiple Sample Analysis">
            <UploadForm 
            multiple={1} 
            handleSubmit={handleSubmit} 
            data={processedData}
            pdbSelections={selectedRows}
            stage={stage}
            setStage={setStage}
            setFile={setFile}
            />
          </div>
        </Tabs>
        </div>
        {renderRows()}
        {TableMode()}
      </Container>
    </div>
  );

}
