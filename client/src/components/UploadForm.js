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
            rowsncols: []
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.addFile = this.addFile.bind(this);
        this.renderFile = this.renderFile.bind(this);
      }

    // Backend incorporation (basic pdb upload for now)
    getReq = () =>{
      if(this.props.multiple ===  0){
          return axios.get(apiURL+"/process") 
      }else if(this.props.multiple === 1){
          return axios.get(apiURL+"/processMult") 
      }else if(this.props.multiple === 2){
          return axios.get(apiURL+"/processTemp") 
      }
    
    }
    onSubmit = () => {
      this.setState({ 
        rowsncols : [],
        dataLoaded: false
      })
        // If file doesn't exist returns
        if (this.state.fileObjects.length === 0) return; 

        const data = new FormData();
        for(var x = 0; x<this.state.fileObjects.length; x++) {
          data.append('file', this.state.fileObjects[x])
        }
        axios.post(apiURL + '/submit', data, {
        }).then(res => {
            if (res.status === 200) {
              this.getReq()
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
            this.setState(prevState => ({
            dataLoaded: true,
            rowsncols : [...prevState.rowsncols,{rows:resp.rows, cols:resp.cols,name:fileObj.name}]
            }));
        }
        }); 
    }
    render() {
        const renderedCards = this.state.rowsncols.map(rowncol => {
          return (<div className="output-table">
            <h6>{rowncol.name}</h6>
            <Card body outline color="secondary" className="restrict-card">
                  <OutTable 
                    data={rowncol.rows} 
                    columns={rowncol.cols} 
                    tableClassName="ExcelTable2007" 
                    tableHeaderRowClass="heading" 
                  />
              </Card>  
          </div>)
        })
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
                multipleFiles = {this.props.multiple}
                renderFile={this.renderFile}
                addFile={this.addFile}
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
                name=".pdb"
              />
            </div>
            <button type="button" className="btn btn-success btn-block formSubmit" onClick={this.onSubmit}>
                  Submit
            </button>
        </div>
        {this.state.dataLoaded && 
          <div> 
            {renderedCards}
          </div>
        }
        </div>
        )
    }
    

}



