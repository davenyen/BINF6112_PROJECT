import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import _ from 'lodash';
import './css/Table.css';

let config = require('../Config.json');

// sort numerically (instead of lexicographically)
// (as using toFixed() in map.js converts to string)
function sortNumerical(a, b, sortOrder) {
    a = parseFloat(a);
    b = parseFloat(b);

    if (!isFinite(a)) return 1;
    if (!isFinite(b)) return -1;

    if (sortOrder === 'desc') {
        return a > b ? -1 : 1;
    } else {
        return a > b ? 1 : -1; 
    }
}

// const { ToggleList } = ColumnToggle;

const CustomToggleList = ({
    columns,
    onColumnToggle,
    toggles
  }) => (
    // btn-group btn-group-toggle btn-group-vertical
    <div className="toggle-bar" data-toggle="buttons">
      {
        columns
          .map(column => ({
            ...column,
            toggle: toggles[column.dataField]
          }))
          .map(column => (
            <button
              type="button"
              key={ column.dataField }
              className={ `btn btn-warning ${column.toggle ? 'active' : ''}` }
              data-toggle="button"
              aria-pressed={ column.toggle ? 'true' : 'false' }
              onClick={ () => onColumnToggle(column.dataField) }
            >
              { column.text }
            </button>
          ))
      }
    </div>
  );

let columns_base = [{
    dataField: 'res_id',
    text: 'ID',
    sort: true,
    sortFunc: sortNumerical,
    headerAlign: "center",
    headerStyle: {
        width: "3rem"
    }
  }, {
    dataField: 'peptideSeq',
    text: 'Sequence',
    sort: true,
    headerStyle: {
        width: "12rem",
    },
    style: {
        wordBreak: "break-all"
    }
  },{
    dataField: 'asa',
    text: 'Relative ASA',
    sort: true,
    sortFunc: sortNumerical,
    style: (cell, row, rowIndex, colIndex) => {
      if (parseFloat(cell) < parseFloat(config.bury_threshold)) {
        return {
          backgroundColor: "#cfcfcf"
        }
      }
    }
  },  {
    dataField: 'ss',
    text: 'Secondary Structure',
    sort: true
  },{
    dataField: 'gravy',
    text: 'GRAVY',
    hidden: true,
    sort: true,
    sortFunc: sortNumerical
  }, {
    dataField: 'pI',
    text: 'Isoelectric Point',
    hidden: true,
    sort: true,
    sortFunc: sortNumerical
  }];

const MyExportCSV = (props) => {
    const handleClick = () => {
        props.onExport();
    };
    return (
        <div>
        <button className="btn btn-success" onClick={ handleClick }>Export {props.caption} to CSV</button>
        </div>
    );
};


export default class Table extends React.Component {
    constructor(props){
        super(props);
        console.log(this.props.data[0])
        console.log(this.props.data)
        if (this.props.data[0] !== undefined) this.state = {ratio: this.props.data[0].hasOwnProperty("snr")};
        else this.state = {ratio: null}

        
    }

    options() {
      onRowClick: console.log("Clicked row");
    }

    render() {
        let columns = columns_base.slice();
        if (this.props.seqWidth) columns[1].headerStyle.width = this.props.seqWidth+"rem";
        if (this.props.data.length > 1) {
          if (this.props.data[0].hasOwnProperty("proteinId") && this.props.data[0].proteinId) {
            let nameCol = {
              dataField: 'proteinId',
              text: 'Peptide Name',
              sort: true,
              headerStyle: {
                  width: "13rem",
              },
              style: {
                  width: "15em",
                  wordBreak: "break-all"
              }
            }
  
            // insert at index 1
            columns.splice(1, 0, nameCol)
          }
  
          let file_data = this.props.data[0].data;
          if (file_data.length > 1) {
              let ratios = this.props.data[0].ratios
              let fileName0 = file_data[0].file.split("/").pop().split(".")[0].trim() + ' ';
              let fileName1 = file_data[1].file.split("/").pop().split(".")[0].trim() + ' ';
              for(let key in ratios) {
                  columns.push({
                      dataField: 'ratios.'+key+'[0]',
                      text: _.startCase(key) + ' Ratio '+fileName0+" : "+fileName1,
                      sort: true,
                      sortFunc: sortNumerical
                    },{
                      dataField: 'ratios.'+key+'[1]',
                      text: _.startCase(key) + ' Ratio '+fileName1+" : "+fileName0,
                      hidden: true,
                      sort: true,
                      sortFunc: sortNumerical
                    }
                  )   
              }
  
              // file data, default state is hidden in table
              for (let i in file_data) {
                  let fileName = file_data[i].file.split("/").pop().split(".")[0].trim() + ' ';
                  columns.push({
                          dataField: 'data['+i+'].foregroundMedian',
                          text: fileName+'Foreground Median',
                          hidden: true,
                          sort: true,
                          sortFunc: sortNumerical
                        },{
                          dataField: 'data['+i+'].SNR_Calculated',
                          text: fileName+'SNR Calculated',
                          hidden: true,
                          sort: true,
                          sortFunc: sortNumerical
                        }
                  )
  
  
                  if (file_data[i].hasOwnProperty("snr") && !isNaN(file_data[i].snr)){
                    columns.push({
                      dataField: 'data['+i+'].snr',
                      text: fileName+'SNR',
                      hidden: true,
                      sort: true,
                      sortFunc: sortNumerical
                    });
                  }
              }
  
          } else {
              for (let i in file_data) {
                  let fileName = file_data[i].file.split("/").pop().split(".")[0].trim() + ' ';
                  columns.push({
                          dataField: 'data['+i+'].foregroundMedian',
                          text: fileName+'Foreground Median',
                          sort: true,
                          sortFunc: sortNumerical
                        },{
                          dataField: 'data['+i+'].SNR_Calculated',
                          text: fileName+'SNR Calculated',
                          sort: true,
                          sortFunc: sortNumerical
                        }
                  )
                  if (file_data[i].hasOwnProperty("snr") && !isNaN(file_data[i].snr)){
                    columns.push({
                      dataField: 'data['+i+'].snr',
                      text: fileName+'SNR',
                      sort: true,
                      sortFunc: sortNumerical
                    });
                  }
              }
          }
  
  
        }

        return (
            <ToolkitProvider
            keyField="peptideSeq"
            data={ this.props.data }
            columns={ columns }
            columnToggle
            exportCSV
            >
                {
                    props => (
                        <div>
                            <br />
                            <CustomToggleList { ...props.columnToggleProps }  />
                            <BootstrapTable options={this.options()} { ...props.baseProps } caption={this.props.caption}/>
                            <hr />
                            <MyExportCSV { ...props.csvProps } caption={this.props.caption}/>
                            <hr />
                            <br />
                        </div>
                    )
                }
            </ToolkitProvider>
        );


        
    }
}
