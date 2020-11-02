import React, { Component } from 'react';
import { Col, Input, InputGroup, InputGroupAddon, FormGroup, Label, Button, Fade, FormFeedback } from 'reactstrap';


export default class UploadField extends Component {

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
        this.fileInput = React.createRef();
      }
    
      // Checks if file is valid
      fileHandler = (event) => {  
        let uploadedFileNames = [];  
        let fileObj = event.target.files;
        if(event.target.files.length){
            this.setState({
                fileObject: event.target.files
            });
              for (var i = 0; i < fileObj.length; i++) {
                  let fileName = fileObj[i].name;
                  if (fileName.slice(fileName.lastIndexOf('.')+1) === this.props.fileTypeOne ||
                    fileName.slice(fileName.lastIndexOf('.')+1) === this.props.fileTypeTwo ){
                    if (i == 0) {
                      this.props.clearFiles(this.props.fileTypeOne);
                      this.props.clearFiles(this.props.fileTypeTwo);
                    }
                    uploadedFileNames.push(fileName);
                    this.setState({
                        isFormInvalid: false
                    });
                    this.props.addFile(fileObj[i]);
                  } else{
                    uploadedFileNames = []
                    this.setState({
                        isFormInvalid: true,
                        fileNames: []
                    })
                    break;
                  }    
              }
              if(this.props.name === ".pdb"){
               
                if(event.target.files.length > 1){
                  uploadedFileNames = []
                  this.setState({
                    fileLimitExceeded: true,
                    fileNames: []
                  })
                }else{
                  this.setState({
                    fileLimitExceeded: false,
                  })
                }
              }else if(this.props.name === ".xlsx/.gpr"){
                if(this.props.multipleFiles === 0){
                  if(event.target.files.length > 2){
                    uploadedFileNames = []
                    this.setState({
                      fileLimitExceeded: true,
                      fileNames: []
                    })
                  }else{
                    this.setState({
                      fileLimitExceeded: false,
                    })
                  }
                }
              }
            } 
            //File length check
            
            //If no errors, setstate and render if available
            if (uploadedFileNames.length > 0) {
              //console.log(this.state.fileLimitExceeded,this.state.isFormInvalid)
              this.setState({
                fileNames: uploadedFileNames.join(", ")
              })
              if (typeof this.props.renderFile === "function") {
                for(let iter=0; iter < fileObj.length;iter++){
                  this.props.renderFile(fileObj[iter]);
                }
                
              }
            }
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
                <Label for="exampleFile" xs={6} sm={4} lg={2} size="lg" style={{fontSize: "1em"}}>Upload {this.props.name}</Label>          
                <Col xs={4} sm={8} lg={10}>                                                     
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button color="info" style={{color: "white", zIndex: 0}} onClick={this.openFileBrowser.bind(this)}>
                            <i className="cui-file"></i>
                            Browse&hellip;
                        </Button>
                    <input type="file" hidden onChange={this.fileHandler.bind(this)} ref={this.fileInput} multiple onClick={(event)=> { event.target.value = null }} style={{"padding":"10px"}}/>    
                    </InputGroupAddon>
                    <Input type="text" className="form-control" value={this.state.fileNames} readOnly invalid={this.state.isFormInvalid || this.state.fileLimitExceeded} />                                              
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