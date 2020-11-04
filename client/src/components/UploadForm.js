import React, { Component } from 'react';
import UploadField from './UploadField';
import axios from 'axios';
import { Card } from 'reactstrap';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';

const apiURL = "http://localhost:8000";

export default class UploadForm extends Component {

    constructor(){
        super();
        this.state={
            isOpen: false,
            dataLoaded: false,
            isFormInvalid: false,
            fileObjects: [],
            rows: null,
            cols: null
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.addFile = this.addFile.bind(this);
        this.renderFile = this.renderFile.bind(this);
      }

    // Backend incorporation (basic pdb upload for now)
    onSubmit = () => {
        this.refreshFilePreviews()
        // If file doesn't exist returns
        if (this.state.fileObjects.length === 0) return; 

        const data = new FormData();
        for(var x = 0; x<this.state.fileObjects.length; x++) {
          data.append('file', this.state.fileObjects[x])
        }
        axios.post(apiURL + '/submit', data, {
        }).then(res => {
            if (res.status === 200) {
              axios.get(apiURL+"/process")
                  .then(rsp => rsp.data)
                  .then(json => {
                    this.setState({
                      processedData: json,
                      dataLoaded: false
                    });
                    this.props.handleSubmit(json);
                    axios.post(apiURL+"/clear")
                  })
            }
        }).catch(err => console.log(err))
      }

    addFile = (fileObj) => {
      console.log(fileObj.name);
      this.setState(prevState => ({
        fileObjects: [...prevState.fileObjects, fileObj]
      }));
    }

    // Loads and renders file to client
    renderFile = (fileObj) => {
        //just pass the fileObj as parameter
        ExcelRenderer(fileObj, (err, resp) => {
        if(err){
            console.log(err);            
        }
        else{
            this.setState({
            dataLoaded: true,
            cols: resp.cols,
            rows: resp.rows
            });
        }
        }); 
    }

    renderExcel(name){
      this.setState({chosenFileName:name})
    }

    componentDidUpdate(props,prevState) {
      let rows,cols;
      this.state.rowsncols.forEach(rowncol => {
        if(rowncol.name === this.state.chosenFileName){
          rows = rowncol.rows
          cols = rowncol.cols
          console.log(this.state.chosenFileName,"EXCEL RENDER")
        }
      })
      
      if(prevState.chosenFileName !== this.state.chosenFileName){
        this.setState({
          cardTorender: <Card body outline color="secondary" className="restrict-card">
                          <OutTable 
                            data={rows} 
                            columns={cols} 
                            tableClassName="ExcelTable2007" 
                            tableHeaderRowClass="heading" 
                          />
                      </Card>  
        })
      }
    }
    refreshFilePreviews = () => {
      this.setState({ 
        rowsncols : [],
        dataLoaded: false,
        cardTorender: ""
      })
    }

    render() {
        return(
        <div>
        <div className="form">
            <div className="uploadFields">
              <UploadField 
                className="xlsx/gpr-form" 
                fileTypeOne="xlsx" 
                fileTypeTwo="gpr"
                warningOne="Please select a .xlsx/.gpr file only!" 
                warningTwo="Maximum of 2 microarray data files allowed!"
                renderFile={this.renderFile}
                addFile={this.addFile}
                clearFiles={this.clearFiles}
                refreshPreview= {this.refreshFilePreviews}
                name=".xlsx/.gpr"
              />
              <UploadField 
                className="pdb-form" 
                fileTypeOne="pdb" 
                fileTypeTwo=""
                warningOne="Please select a pdb file only!" 
                warningTwo="Only 1 pdb file allowed!"
                renderFile={null}
                addFile={this.addFile}
                clearFiles={this.clearFiles}
                refreshPreview= {this.refreshFilePreviews}
                name=".pdb"
              />
            </div>
            <button type="button" className="btn btn-success btn-block formSubmit" onClick={this.onSubmit}>
                  Submit
            </button>
        </div>
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
        </div>
        )
    }

}
