import React, {Component} from 'react';
import UploadField from './UploadField';
import axios from 'axios';
import {Card} from 'reactstrap';
import {OutTable, ExcelRenderer} from 'react-excel-renderer';
import './css/Upform.css'
import ProteinStructure from './ProteinStructure'
import ReactEcharts from "echarts-for-react";
import echarts from 'echarts';
// import 'echarts/lib/chart/line';
// import 'echarts/lib/component/tooltip';
import {ButtonGroup, Button} from 'react-bootstrap'

let config = require('../Config.json');

// LOCAL MODE = "http://localhost:5000"
// HEROKU MODE = "https://microarray-analysis.herokuapp.com"
// const apiURL = "http://localhost:5000";
const apiURL = "";

export default class UploadForm extends Component {

  constructor() {
    super();
    this.state = {
      isOpen: false,
      dataLoaded: false,
      isFormInvalid: false,
      fileObjects: [],
      rowsncols: [],
      cardTorender: "",
      chosenFileName: "",
      pdbFile: null,
      chartVisible: false,
      chartType: '0'
      // chartType: 'median',//median|snr|include
      //submitted:false
    }
    this.myChart = React.createRef()
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
              dataLoaded: false
            });
            json.mode = this.props.multiple;
            this.props.handleSubmit(json);
            axios.post(apiURL + "/clear")
          })
      }
    }).catch(err => console.log(err))
  }

  // appends files to objects state
  addFile = (fileObj) => {
    //this.setState({submitted:false})
    //console.log(fileObj.name);
    if (fileObj.type === "") {
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

  handleData(num = 0) {
    let {data} = this.props
    if (this.props.multiple === 0) {
      data = data.peptides
    } else if (this.props.multiple === 1) {
      data = data.pepData
    }

    let columns = [];
    for (let c in data[num].data[0].columns) {
      columns.push(data.map(item => {
        return {
          value: item.data[num].columns[c],
          ss: item.ss,
          pI: item.pI,
          gravy: item.gravy,
          asa: item.asa,
          pepSeq: item.peptideSeq
        }
      }))
    }

    // const median = data.map(item => {
    //   return {
    //     value: item.data[num].foregroundMedian,
    //     ss: item.ss,
    //     pI: item.pI,
    //     gravy: item.gravy,
    //     asa: item.asa,
    //     pepSeq: item.peptideSeq
    //   }
    // });
    // const snr = data.map(item => {
    //   return {
    //     value: item.data[num].SNR_Calculated,
    //     ss: item.ss,
    //     pI: item.pI,
    //     gravy: item.gravy,
    //     asa: item.asa,
    //     pepSeq: item.peptideSeq
    //   }
    // });
    // let includeSnr
    // if (data[0].data[num].snr !== 'NaN') {
    //   includeSnr = data.map(item => {
    //     return {
    //       value: item.data[num].snr.replace(' ', ''),
    //       ss: item.ss,
    //       pI: item.pI,
    //       gravy: item.gravy,
    //       asa: item.asa,
    //       pepSeq: item.peptideSeq
    //     }
    //   });
    // }
    const seq = data.map(item => {
      return {
        value: item.res_id + '\n' + item.peptideSeq.substr(0, config.overlap.amount),
        textStyle: {
          color: item.asa > 0.2 ? '#447fdb' : 'gray'
        }
      }
    });
    // const finalMedian = [], finalSnr = [], finalIncludeSnr = [], 
    let finalSeq = []
    // let finalColumns = new Array(columns.length).fill([]);
    let finalColumns = [];
    columns.forEach(() => finalColumns.push([]));
    let curSeqIndex = 0
    let i = +(seq[0].value.split('\n')[0]);
    while (i < +(seq[seq.length - 1].value.split('\n')[0])) {
      let res_id = +(seq[curSeqIndex].value.split('\n')[0])
      if (res_id <= i) {
        for (let c in columns) {
          finalColumns[c].push(columns[c][curSeqIndex]);
        }
        // console.log(finalColumns[0]);
        // console.log(finalColumns[1]);
        finalSeq.push(seq[curSeqIndex])
        // finalMedian.push(median[curSeqIndex])
        // finalSnr.push(snr[curSeqIndex])
        // if (includeSnr) finalIncludeSnr.push(includeSnr[curSeqIndex])
        curSeqIndex += 1
        i = res_id;
      } else {
        finalSeq.push({value: '-'})
        for (let c in columns) {
          finalColumns[c].push(0);
        }
        // finalMedian.push(0)
        // finalSnr.push(0)
        // if (includeSnr) finalIncludeSnr.push(0)
      }

      i += config.overlap.amount;
    }
    return {
      name: data[0].data && data[0].data[num].file.substr(data[0].data[num].file.lastIndexOf('/') + 1).split(".")[0],
      seq: finalSeq,
      // median: finalMedian,
      // snr: finalSnr,
      // includeSnr: includeSnr && finalIncludeSnr
      columns: finalColumns
    }
  }

  getChartOption() {
    let {data} = this.props
    if (this.props.multiple === 0) {
      data = data.peptides
    } else if (this.props.multiple === 1) {
      data = data.pepData
    }
    const {chartType} = this.state;
    if (!data) return {}
    const options = {
      toolbox: {
        show: true,
        feature: {
          myFull: {
            show: true,
            title: 'Full Screen',
            icon: 'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891',
            onclick: () => {
              const element = document.getElementById('vehicleProvince');
              if (window.ActiveXObject) {
                const WsShell = new window.ActiveXObject('WScript.Shell');
                WsShell.SendKeys('{F11}');
              } else if (element.requestFullScreen) {
                element.requestFullScreen();
              } else if (element.msRequestFullscreen) {
                element.msRequestFullScreen();
              } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
              } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
              }
            },
          },
        },
        top: -5,
      },
      xAxis: {
        type: 'category',
        triggerEvent: true,
        axisLabel: {
          interval: 0,
        },
        data: this.handleData().seq
      },
      dataZoom: [{
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        left: '9%',
        bottom: -5,
        start: 0,
        end: 10,
      }],
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis',
        formatter(params) {
          const item = params[0];
          // ${dataType}：${item.data.value}<br />
          return `2° structure：${item.data.ss}<br />
                  relative ASA: ${item.data.asa}<br />
                  pI: ${item.data.pI}<br />
                  gravy: ${item.data.gravy}<br />
               `;
        },
      },
      legend: {
        data: []
      },
      series: []
    }

    const fileLength = data[0].data.length
    for (let i = 0; i < fileLength; i++) {
      let d = this.handleData(i);
      //console.log(d);
      options.legend.data.push(d.name)
      options.series.push({
        name: d.name,
        data: d.columns[chartType],
        type: 'line'
      })
    }

    // if (chartType === 'include') {
    //   for (let i = 0; i < fileLength; i++) {
    //     if (!this.handleData(i).includeSnr) continue
    //     options.legend.data.push(this.handleData(i).name)
    //     options.series.push({
    //       name: this.handleData(i).name,
    //       data: this.handleData(i).includeSnr,
    //       type: 'line'
    //     })
    //   }
    // } else if (chartType === 'median') {
    //   for (let i = 0; i < fileLength; i++) {
    //     options.legend.data.push(this.handleData(i).name)
    //     options.series.push({
    //       name: this.handleData(i).name,
    //       data: this.handleData(i).median,
    //       type: 'line'
    //     })
    //   }
    // } else {
    //   for (let i = 0; i < fileLength; i++) {
    //     options.legend.data.push(this.handleData(i).name)
    //     options.series.push({
    //       name: this.handleData(i).name,
    //       data: this.handleData(i).snr,
    //       type: 'line'
    //     })
    //   }
    // }
    return options
  }

  // isIncludeSRN() {
  //   let {data} = this.props
  //   if (!data) return false
  //   if (this.props.multiple === 0) {
  //     data = data.peptides
  //   } else if (this.props.multiple === 1) {
  //     data = data.pepData
  //   }
  //   return !!(data[0].data && data[0].data.some(item => item.snr !== 'NaN'));
  // }

  // set state
  onChartClick = (...e) => {
    var tmpArr = [...this.props.selectedRows];

    var tmpStr = e[0].name.toString();
    var fields = tmpStr.split('\n');

    if (this.props.selectedRows.includes(fields[0])) {
      var delIndex = tmpArr.indexOf(fields[0]);
      tmpArr.splice(delIndex, 1);
    } else {
      tmpArr.push(fields[0]);
    }

    this.props.setSelectedRows(tmpArr);
  }

  render() {
    let onEvents = {
      'click': this.onChartClick
    }
    const {chartType} = this.state;
    const renderedButtons = this.state.rowsncols.map(rowncol => {
      let claname = this.state.chosenFileName === rowncol.name ? 'button-item-sel' : 'button-item'
      return (
        <div>
          <button
            className={claname}
            onClick={() => this.ToggleExcelPreview(rowncol)}>
            {rowncol.name}
          </button>
        </div>
      )
    })

    let chartButtons = [];
    if (this.props.data) {
      let {data} = this.props
      if (this.props.multiple === 0) {
        data = data.peptides
      } else if (this.props.multiple === 1) {
        data = data.pepData
      }
  
      for (let c in data[0].columnDisplayNames) {
        chartButtons.push(<Button active={chartType === c}
        onClick={() => this.setState({chartType: c})}>{data[0].columnDisplayNames[c]}</Button>)
      }
    }

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
          <button type="button" className="btn btn-success btn-block formSubmit" onClick={this.onSubmit}>
            Submit
          </button>
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
            {!!this.props.data && <><ButtonGroup justified> {chartButtons}
              {/* <Button active={chartType === 'median'}
                      onClick={() => this.setState({chartType: 'median'})}>Foreground Median</Button>
              <Button active={chartType === 'snr'}
                      onClick={() => this.setState({chartType: 'snr'})}>Calculated SNR</Button>
              {this.isIncludeSRN() && <Button active={chartType === 'include'}
                                              onClick={() => this.setState({chartType: 'include'})}>Included
                SNR</Button>
              } */}
            </ButtonGroup>
              <ReactEcharts 
                style={{height: '80%', minHeight: 320}} 
                ref={this.myChart} 
                echarts={echarts} 
                notMerge={true}
                option={this.getChartOption()}
                onEvents={onEvents}
              />
              <br/>
              <p> Blue: Exposed; Grey: Buried</p>
            </>}
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




