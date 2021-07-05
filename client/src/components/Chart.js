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
      chartType: '0',
      chartOption: {
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
            data: []
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
    }
    // this.myChart = React.createRef()
  }

  changeScroll() {
    let style = document.body.style.overflow
    document.body.style.overflow = (style === 'hidden') ? 'auto' : 'hidden'
  }

  handleData(num = 0) {
    let {data} = this.props
    data = data.peptides;

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
            res_id: item.res_id,
            peptideSeq: item.peptideSeq
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

    }

    return {
      name: data[0] && data[0].data && data[0].data[num].file.substr(data[0].data[num].file.lastIndexOf('/') + 1).split(".")[0],
      seq: finalSeq,
      columns: finalColumns
    }
  }

  getChartOption() {
    let {data} = this.props;
    data = data.peptides;

    const {chartType} = this.state;
    if (!data) return {}
    // const options = {...this.state.chartOption}

    // options.xAxis.data = this.handleData().seq;

    const fileLength = data[0] ? data[0].data.length : 0;
    let series = [];
    let legendData = []
    for (let i = 0; i < fileLength; i++) {
        let d = this.handleData(i);
        legendData.push(d.name)
        series.push({
            name: d.name,
            data: d.columns[chartType],
            type: 'line',
            markPoint: {
              data: []
            }
        })
    }
    // console.log(options);
    this.setState(prevState => ({...prevState, chartOption: 
        {...prevState.chartOption, 
            series: series, 
            legend: {
              data: legendData
            },
            xAxis: {
              ...prevState.chartOption.xAxis, data: this.handleData().seq
            }
        }
      }))

    return;
  }

  // set state
  onChartClick = (...e) => {
        // var tmpArr = [...this.props.selectedRows];
        let data = e[0].data;
        
        if (data && data.res_id) {
            let tmpArr = [];
            // let series = [...this.state.chartOption.series];
            if (this.props.selectedRows.find(d => d.res_id === data.res_id)) {
                // var delIndex = tmpArr.indexOf(fields[0]);
                // tmpArr.splice(delIndex, 1);
                tmpArr.length = 0;
                // series = series.map(s => {
                //   s.markPoint.data = [];
                //   return s;
                // })
            } else {
                // series = series.map(s => {
                //   s.markPoint.data = [{ value: e[0].value, xAxis: e[0].dataIndex, yAxis: e[0].value }];
                //   return s;
                // })
                tmpArr.push(data);
            }

            this.props.setSelectedRows(tmpArr);
            // this.setState(prevState => ({
            //   ...prevState,
            //   chartOption: {...prevState.chartOption, series: series}
            // }))
            // this.state.chartOption.series[e.seriesIndex]['markPoint'].data = [
            //   { value: e.value[1], xAxis: e.dataIndex, yAxis: e.value[1] }
            // ];
        }
  }

  componentDidMount() {
    this.getChartOption();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data || this.state.chartType !== prevState.chartType) {
      this.getChartOption();
    }
  }


  render() {
    let onEvents = {
      'click': this.onChartClick
    }
    const {chartType} = this.state;

    let chartButtons = [];
    if (this.props.data.peptides && this.props.data.peptides[0]) {
      let {data} = this.props;
      data = data.peptides;
  
      for (let c in data[0].columnDisplayNames) {
        chartButtons.push(<Button active={chartType === c} key={c} variant="light"
        onClick={() => this.setState({chartType: c})}>{data[0].columnDisplayNames[c]}</Button>)
      }
    }

    // this.setState({chartOption: this.getChartOption()})
    // this.getChartOption();

    return (
        <>
        <ButtonGroup size="sm"> {chartButtons}</ButtonGroup>
        <ReactEcharts 
            style={{height: '80%', minHeight: 320}} 
            // ref={this.myChart} 
            ref={(e) => {
              this.echartsReactRef = e;
            }}
            echarts={echarts} 
            notMerge={true}
            option={this.state.chartOption}
            onEvents={onEvents}
        />
        <br/>
        <p> Blue: Exposed; Grey: Buried/No data</p>
        </>
    )
  }
}




