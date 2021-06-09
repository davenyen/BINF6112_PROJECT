import React, {Component} from 'react';
import './css/Upform.css'
import ReactEcharts from "echarts-for-react";
import echarts from 'echarts';
import {ButtonGroup, Button} from 'react-bootstrap'

let config = require('../Config.json');

export default class Chart extends Component {

  constructor() {
    super();
    this.state = {
      cardTorender: "",
      chartVisible: false,
      chartType: '0'
    }
    this.myChart = React.createRef()
  }

  changeScroll() {
    let style = document.body.style.overflow
    document.body.style.overflow = (style === 'hidden') ? 'auto' : 'hidden'
  }

  handleData(num = 0) {
    let {data} = this.props
    if (this.props.multiple === 0) {
      data = data.peptides
    } else if (this.props.multiple === 1) {
      data = data.pepData
    }

    let columns = [];
    let finalSeq = []
    let finalColumns = [];
    if (data[num]) {
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


      const seq = data.map(item => {
        return {
          value: (item.res_id ? item.res_id : '') + '\n' + item.peptideSeq.substr(0, config.overlap.amount),
          textStyle: {
            color: item.asa > 0.2 ? '#447fdb' : 'gray'
          }
        }
      });

      columns.forEach(() => finalColumns.push([]));
      seq.forEach((s, ind) => {
        for (let c in columns) {
            finalColumns[c].push(columns[c][ind]);
        }
        finalSeq.push(s);
      })

    //   let curSeqIndex = 0
    //   let i = +(seq[0].value.split('\n')[0]);
    //   while (i < +(seq[seq.length - 1].value.split('\n')[0])) {
    //     let res_id = +(seq[curSeqIndex].value.split('\n')[0])
    //     if (res_id <= i) {
    //       for (let c in columns) {
    //         finalColumns[c].push(columns[c][curSeqIndex]);
    //       }
    //       finalSeq.push(seq[curSeqIndex])
    //       curSeqIndex += 1
    //       i = res_id;
    //     } else {
    //       finalSeq.push({value: '-'})
    //       for (let c in columns) {
    //         finalColumns[c].push(0);
    //       }
    //     }
  
    //     i += config.overlap.amount;
    //   }

    }

    return {
      name: data[0] && data[0].data && data[0].data[num].file.substr(data[0].data[num].file.lastIndexOf('/') + 1).split(".")[0],
      seq: finalSeq,
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
            return `2° structure：${item.data.ss ? item.data.ss : "-"}<br />
                    relative ASA: ${item.data.asa ? item.data.asa : "-"}<br />
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

    const fileLength = data[0] ? data[0].data.length : 0;
    for (let i = 0; i < fileLength; i++) {
        let d = this.handleData(i);
        options.legend.data.push(d.name)
        options.series.push({
            name: d.name,
            data: d.columns[chartType],
            type: 'line'
        })
    }
    return options
  }

  // set state
  onChartClick = (...e) => {
        var tmpArr = [...this.props.selectedRows];

        let val = e[0].name ? e[0].name : e[0].value;
        var tmpStr = val.toString();
        var fields = tmpStr.split('\n');
        
        if (fields[0]) {
            if (this.props.selectedRows.includes(fields[0])) {
                var delIndex = tmpArr.indexOf(fields[0]);
                tmpArr.splice(delIndex, 1);
            } else {
                tmpArr.push(fields[0]);
            }

            this.props.setSelectedRows(tmpArr);
        }
  }

  render() {
    let onEvents = {
      'click': this.onChartClick
    }
    const {chartType} = this.state;

    let chartButtons = [];
    if (this.props.data && this.props.data[0]) {
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
        <>
        <ButtonGroup> {chartButtons}</ButtonGroup>
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
        </>
    )
  }
}




