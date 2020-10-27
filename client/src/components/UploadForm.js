import React, { Component } from 'react';
import UploadField from './UploadField';
import axios from 'axios';
import { Card } from 'reactstrap';
import { OutTable } from 'react-excel-renderer';

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
            cols: null,
            processedData: null
        }
        // this.fileHandler = this.fileHandler.bind(this);
        // this.toggle = this.toggle.bind(this);
        // this.openFileBrowser = this.openFileBrowser.bind(this);
        // this.renderFile = this.renderFile.bind(this);
        this.fileInput = React.createRef();
      }

    // Backend incorporation (basic pdb upload for now)
    onSubmit = () => {
        // If file doesn't exist returns
        if (this.state.fileObjects == []) return; 

        // Vars passed to update App.js state, changes parent state to child state
        var dataLoaded = this.state.dataLoaded;
        var processedData = this.state.processedData;
        var rows = this.state.rows;
        var cols = this.state.cols;
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

    render() {
        return(
        <div className="form">
            <div className="uploadFields">
              <UploadField 
                className="xlsx/gpr-form" 
                fileTypeOne="xlsx" 
                fileTypeTwo="gpr"
                warningOne="Please select a .xlsx/.gpr file only!" 
                warningTwo="Maximum of 2 microarray data files allowed!"
                handleSubmit={this.props.handleSubmit}
                addFile={this.addFile}
              />
              <UploadField 
                className="pdb-form" 
                fileTypeOne="pdb" 
                fileTypeTwo=""
                warningOne="Please select a pdb file only!" 
                warningTwo="Only 1 pdb file allowed!"
                handleSubmit={null}
                addFile={this.addFile}
              />
            </div>
            <button type="button" className="btn btn-success btn-block formSubmit" onClick={this.onSubmit}>
                  Submit
            </button>


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
