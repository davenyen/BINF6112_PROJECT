import React, { Component } from 'react';
import axios from 'axios';
import { Col, Input, InputGroup, InputGroupAddon, FormGroup, Label, Button, Fade, FormFeedback } from 'reactstrap';
import { ExcelRenderer } from 'react-excel-renderer';

const apiURL = "http://localhost:8000";

export default class UploadForm extends Component {

    constructor(){
        super();
        this.state={
            isOpen: false,
            dataLoaded: false,
            isFormInvalid: false,
            fileObject: null,
            fileLimitExceeded: false,
            rows: null,
            cols: null,
            processedData: null
        }
        this.fileHandler = this.fileHandler.bind(this);
        this.toggle = this.toggle.bind(this);
        this.openFileBrowser = this.openFileBrowser.bind(this);
        this.renderFile = this.renderFile.bind(this);
        this.fileInput = React.createRef();
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
    
      // Checks if file is valid
      fileHandler = (event) => {    
        if(event.target.files.length){
            this.setState({
                fileObject: event.target.files
            });
            let fileObj = event.target.files;
            let uploadedFileNames = [];
            if(fileObj.length === 1){
              for (var i = 0; i < fileObj.length; i++) {
                  let fileName = fileObj[i].name;
                  if (fileName.slice(fileName.lastIndexOf('.')+1) === this.props.fileTypeOne ||
                    fileName.slice(fileName.lastIndexOf('.')+1) === this.props.fileTypeTwo ){
                    uploadedFileNames.push(fileName);
                    this.setState({
                        isFormInvalid: false
                    });
                    this.renderFile(fileObj[i])
                  } else{
                    this.setState({
                        isFormInvalid: true,
                        uploadedFileNames: []
                    })
                    break;
                  }    
      
              }
            } else {
              this.setState({
                fileLimitExceeded: true,
                uploadedFileNames: []
              })
            }
    
            //check for file extension and pass only if it is .xlsx and display error message otherwise
            if (uploadedFileNames.length > 0) {
              this.setState({
                uploadedFileNames: uploadedFileNames.join(", ")
              })
            }
        }               
      }
    
      // Backend incorporation (basic pdb upload for now)
      onClickHandler = () => {
        // If file doesn't exist returns
        if (this.state.fileObject == null) return; 

        // Vars passed to update App.js state, changes parent state to child state
        var dataLoaded = this.state.dataLoaded;
        var processedData = this.state.processedData;
        var rows = this.state.rows;
        var cols = this.state.cols;
        if (typeof this.props.handleSubmit === "function") this.props.handleSubmit(dataLoaded, rows, cols, processedData);

        const data = new FormData();
        for(var x = 0; x<this.state.fileObject.length; x++) {
          data.append('file', this.state.fileObject[x])
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
                  });
            }
        }).catch(err => console.log(err))
      }
    
      toggle() {
        this.setState({
          isOpen: !this.state.isOpen
        });
      }
    
      openFileBrowser = () => {
        this.fileInput.current.click();
      }

    render() {
        return (
        <form className={this.props.className}>
            <FormGroup row>
                <Label for="exampleFile" xs={6} sm={4} lg={2} size="lg">Upload {this.props.fileType}</Label>          
                <Col xs={4} sm={8} lg={10}>                                                     
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button color="info" style={{color: "white", zIndex: 0}} onClick={this.openFileBrowser.bind(this)}>
                            <i className="cui-file"></i>
                            Browse&hellip;
                        </Button>
                    <input type="file" hidden onChange={this.fileHandler.bind(this)} ref={this.fileInput} multiple onClick={(event)=> { event.target.value = null }} style={{"padding":"10px"}} />      
                    <button type="button" className="btn btn-success btn-block" onClick={this.onClickHandler}>
                    Submit
                    </button>
                    </InputGroupAddon>
                    <Input type="text" className="form-control" value={this.state.uploadedFileNames} readOnly invalid={this.state.isFormInvalid || this.state.fileLimitExceeded} />                                              
                    <FormFeedback>    
                    <Fade in={this.state.isFormInvalid} tag="h6" style={{fontStyle: "italic"}}>
                      {this.props.warningOne}
                    </Fade> 
                    <Fade in={this.state.fileLimitExceeded} tag="h6" style={{fontStyle: "italic"}}>
                      {this.props.warningTwo}
                  </Fade>                                                                       
                    </FormFeedback>
                </InputGroup>     
                </Col>                                                   
            </FormGroup>
        </form>
      )
  }
}