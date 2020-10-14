import React from 'react'

export default function Upload(props) {
    return (
        <Container>
            <form className="input-form">
            <FormGroup row>
                <Label for="exampleFile" xs={6} sm={4} lg={2} size="lg">Upload</Label>          
                <Col xs={4} sm={8} lg={10}>                                                     
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                    <Button color="info" style={{color: "white", zIndex: 0}} onClick={this.openFileBrowser.bind(this)}><i className="cui-file"></i> Browse&hellip;</Button>
                    <input type="file" hidden onChange={this.fileHandler.bind(this)} ref={this.fileInput} onClick={(event)=> { event.target.value = null }} style={{"padding":"10px"}} />                                
                    </InputGroupAddon>
                    <Input type="text" className="form-control" value={this.state.uploadedFileName} readOnly invalid={this.state.isFormInvalid} />                                              
                    <FormFeedback>    
                    <Fade in={this.state.isFormInvalid} tag="h6" style={{fontStyle: "italic"}}>
                        Please select a .xlsx file only !
                    </Fade>                                                                
                    </FormFeedback>
                </InputGroup>     
                </Col>                                                   
            </FormGroup>   
            </form>

            {this.state.dataLoaded && 
            <div className="output-table">
            <Card body outline color="secondary" className="restrict-card">
                <OutTable data={this.state.rows} columns={this.state.cols} tableClassName="ExcelTable2007" tableHeaderRowClass="heading" />
            </Card>  
            </div>}
        </Container>
    )
}