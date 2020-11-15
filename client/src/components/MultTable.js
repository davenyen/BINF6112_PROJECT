import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
//import _ from 'lodash';
import '../App.css';

let config = require('../frontend_config.json');

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
},{
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
  },{
    dataField: 'aveSNR',
    text: 'Average calculated SNR',
    sort: true,
    sortFunc: sortNumerical
  },{
    dataField: 'aveFM',
    text: 'Average Foregroud Median',
    sort: true,
    sortFunc: sortNumerical
  }];

const MyExportCSV = (props) => {
    const handleClick = () => {
        props.onExport();
    };
    return (
        <div>
        <button className="btn btn-success" onClick={ handleClick }>Export to CSV</button>
        </div>
    );
};

let epitope_columns_base = [{
  dataField: 'res_id',
  text: 'ID',
  sort: true,
  sortFunc: sortNumerical,
  headerAlign: "center",
  headerStyle: {
      width: "3rem"
  }
},{
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
  },{
    dataField: 'maxFm',
    text: 'Maximum Foregroud Median',
    sort: true,
    sortFunc: sortNumerical
  },{
    dataField: 'minFm',
    text: 'Minimum Foregroud Median',
    sort: true,
    sortFunc: sortNumerical
  },{
    dataField: 'foregroundMedian',
    text: 'Average Foregroud Median',
    sort: true,
    sortFunc: sortNumerical
  },{
    dataField: 'snrC',
    text: 'Calculated Average SNR',
    sort: true,
    sortFunc: sortNumerical
  },{
    dataField: 'percentFiles',
    text: '% of presence',
    sort: true,
    sortFunc: sortNumerical
  }];


export default class MultTable extends React.Component {
    render() {
        let columns = columns_base.slice();
        let epitopeCols = epitope_columns_base.slice();
        if (this.props.data.pepData[0].hasOwnProperty("pepName") && this.props.data.pepData[0].pepName) {
          let nameCol = {
            dataField: 'pepName',
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

        if(!(isNaN(parseFloat(this.props.data.pepData[0].snr)))){
            columns.push({
              dataField: 'snr',
              text: 'Included SNR',
              sort: true,
              sortFunc: sortNumerical
            })
        }
        return (
          <div>
          <h1>Epitope Information</h1>
          <ToolkitProvider
          keyField="peptideSeq"
          data={ this.props.data.epiData}
          columns={ epitopeCols }
          columnToggle
          exportCSV
          >
              {
                  props => (
                      <div>
                          <MyExportCSV { ...props.csvProps } />
                          <hr />
                          <CustomToggleList { ...props.columnToggleProps }  />
                          <hr />
                          <BootstrapTable { ...props.baseProps } />
                      </div>
                  )
              }
          </ToolkitProvider>
          <h1>Individual peptide Information</h1>
          <ToolkitProvider
          keyField="peptideSeq"
          data={ this.props.data.pepData}
          columns={ columns }
          columnToggle
          exportCSV
          >
              {
                  props => (
                      <div>
                          <MyExportCSV { ...props.csvProps } />
                          <hr />
                          <CustomToggleList { ...props.columnToggleProps }  />
                          <hr />
                          <BootstrapTable { ...props.baseProps } />
                      </div>
                  )
              }
          </ToolkitProvider>
            </div>
        );


        
    }
}
