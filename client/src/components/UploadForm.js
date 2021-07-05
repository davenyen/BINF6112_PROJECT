import React, {Component} from 'react';
import UploadField from './UploadField';
import Chart from './Chart';
import axios from 'axios';
import {Card} from 'reactstrap';
import {OutTable, ExcelRenderer} from 'react-excel-renderer';
import './css/Upform.css'
import ProteinStructure from './ProteinStructure'
import CircularProgress from '@material-ui/core/CircularProgress';

// LOCAL MODE = "http://localhost:5000"
// HEROKU MODE = "https://microarray-analysis.herokuapp.com"
// const apiURL = "http://localhost:5000";
const apiURL = "";

export default class UploadForm extends Component {

  constructor() {
    super();
    this.state = {
      dataLoaded: false,
      isFormInvalid: false,
      fileObjects: [],
      rowsncols: [],
      cardTorender: "",
      chosenFileName: "",
      pdbFile: null,
      loading: false
      //submitted:false
    }
    this.onSubmit = this.onSubmit.bind(this);
    this.addFile = this.addFile.bind(this);
    this.renderFile = this.renderFile.bind(this);
    this.renderExcel = this.renderExcel.bind(this);
    this.clearFiles = this.clearFiles.bind(this);
  }

  // Backend incorporation (basic pdb upload for now)
  getReq = () => {
    if (this.props.multiple === 0) {
      return axios.get(apiURL + "/process")
    } else if (this.props.multiple === 1) {
      return axios.get(apiURL + "/processMult")
    }
  }

  onSubmit = () => {
    this.refreshFilePreviews()
    //this.setState({submitted:true})
    // If file doesn't exist returns
    if (this.state.fileObjects.length === 0) return;

    this.setState({loading: true});

    const data = new FormData();
    for (var x = 0; x < this.state.fileObjects.length; x++) {
      data.append('file', this.state.fileObjects[x])
    }
    axios.post(apiURL + '/submit', data, {}).then(res => {
      if (res.status === 200) {
        this.getReq()
          .then(rsp => rsp.data)
          .then(json => {
            //console.log(json);
            this.setState({
              loading: false,
              dataLoaded: false
            });
            json.mode = this.props.multiple;
            this.props.handleSubmit(json);
            axios.post(apiURL + "/clear")
          })
          .catch(err => {
            console.log(err);
            axios.post(apiURL+"/clear")
          })
      }
    }).catch(err => {
      console.log(err);
      axios.post(apiURL+"/clear")
    })
  }

  // appends files to objects state
  addFile = (fileObj) => {
    if (fileObj.type === "" || fileObj.name.match(/.pdb$/)) {
      this.setState(prevState => ({
        fileObjects: [...prevState.fileObjects, fileObj],
        pdbFile: fileObj
      }));
    } else {
      this.setState(prevState => ({
        fileObjects: [...prevState.fileObjects, fileObj],
      }));
    }
  }

  clearFiles = (fileType1, fileType2) => {
    if (!fileType1 || fileType1.length === 0) return;
    var regex1 = new RegExp(fileType1 + "$");
    this.setState(prevState => ({
      fileObjects: prevState.fileObjects.filter(f => !f.name.match(regex1))
    }));

    if (!fileType2 || fileType2.length === 0) return;
    var regex2 = new RegExp(fileType2 + "$");
    this.setState(prevState => ({
      fileObjects: prevState.fileObjects.filter(f => !f.name.match(regex2))
    }));
  }

  // Loads and renders file to client
  renderFile = (fileObj) => {
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        this.setState(prevState => ({
          dataLoaded: true,
          rowsncols: [...prevState.rowsncols, {rows: resp.rows, cols: resp.cols, name: fileObj.name}]
        }));
      }
    });
  }

  changeScroll() {
    let style = document.body.style.overflow
    document.body.style.overflow = (style === 'hidden') ? 'auto' : 'hidden'
  }


  renderExcel(name) {
    this.setState({chosenFileName: name})
  }

  componentDidUpdate(props, prevState) {
    let rows, cols;
    this.state.rowsncols.forEach(rowncol => {
      if (rowncol.name === this.state.chosenFileName) {
        rows = rowncol.rows
        cols = rowncol.cols
        console.log(this.state.chosenFileName, "EXCEL RENDER")
      }
    })

    if (prevState.chosenFileName !== this.state.chosenFileName) {
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

    if (this.state.pdbFile !== prevState.pdbFile) {
      this.props.setSelectedRows([]);
    }
  }

  refreshFilePreviews = () => {
    this.setState({
      rowsncols: [],
      dataLoaded: false,
      cardTorender: ""
    })
  }

  // Toggles excel preview for xls file
  ToggleExcelPreview(rowncol) {
    this.renderExcel(rowncol.name)
  }

  render() {
    const renderedButtons = this.state.rowsncols.map((rowncol, ind) => {
      let claname = this.state.chosenFileName === rowncol.name ? 'button-item-sel' : 'button-item'
      return (
        <div key={ind}>
          <button
            className={claname}
            onClick={() => this.ToggleExcelPreview(rowncol)}>
            {rowncol.name}
          </button>
        </div>
      )
    })

    return (
      <div>
        <div className="form">
          <div className="uploadFields">
            <UploadField
              className="xlsx/gpr-form"
              fileTypeOne="xlsx"
              fileTypeTwo="gpr"
              warningOne="Please select .xlsx/.gpr files only!"
              warningTwo="Maximum of 2 microarray data files allowed!"
              multipleFiles={this.props.multiple}
              renderFile={this.renderFile}
              addFile={this.addFile}
              clearFiles={this.clearFiles}
              refreshPreview={this.refreshFilePreviews}
              name=".xlsx/.gpr"
              //submitted={this.state.submitted}
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
              refreshPreview={this.refreshFilePreviews}
              name=".pdb"
              //submitted={this.state.submitted}
            />
          </div>
          <div style={{display: "flex", flexDirection: "column", width: "10%"}}>
            <button type="button" className="btn btn-success btn-block formSubmit" onClick={this.onSubmit}>
              Submit
            </button>
            {this.state.loading &&
              <div style={{padding: "1rem", paddingLeft: "2.5rem", justifyContent: "space-around"}}>
                <CircularProgress size={30}/>
              </div>
            }
          </div>
        </div>
        {this.state.dataLoaded &&
        <div>
          {renderedButtons}<br/>
          {this.state.cardTorender}
        </div>
        }

        {this.state.pdbFile &&
        <div className='visualisation-wrap' style={{display: "flex"}}>
          <div className={'chart-wrap'} id={'vehicleProvince'} style={{backgroundColor: 'white'}}>
            {!!this.props.data && 
              <Chart 
                data={this.props.data}
                multiple={this.props.multiple}
                setSelectedRows={this.props.setSelectedRows}
                selectedRows={this.props.selectedRows}
              />
            }
          </div>
          <div
            onMouseEnter={this.changeScroll}
            onMouseLeave={this.changeScroll}
            className={'chart-wrap'}>
            <ProteinStructure 
            pdbFile={this.state.pdbFile}
            selectedRows={this.props.selectedRows}
            setSelectedRows={this.props.setSelectedRows}
            />
          </div>
        </div>
        }
      </div>
    )
  }
}




