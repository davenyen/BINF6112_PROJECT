import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
// import _ from 'lodash';
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

export const peptide_columns_base = [{
  dataField: 'id',
  text: 'ID',
  sort: true,
  sortFunc: sortNumerical,
  headerAlign: "center",
  headerStyle: {
      width: "3rem"
  }
  },{
    dataField: 'res_id',
    text: 'Res ID',
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
    headerStyle: {},
    style: {
        width: "15em",
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
        if (this.props.data[0] !== undefined) this.state = {ratio: this.props.data[0].hasOwnProperty("snr")};
        else this.state = {ratio: null}
    }

    render() {

        const selectRow = {
          mode: 'checkbox',
          clickToSelect: true,
          bgColor: '#00BFFF',
          hideSelectColumn: true
        };
        
        const rowEvents = {
          onClick: (e, row, rowIndex) => {

            var tmpArr = [...this.props.selectedRows];

            // Removes from array
            if (this.props.selectedRows.includes(this.props.data[rowIndex])) {
              var delIndex = tmpArr.indexOf(this.props.data[rowIndex]);
              tmpArr.splice(delIndex, 1);
            } else {
              tmpArr.push(this.props.data[rowIndex]);
            }

            this.props.setSelectedRows(tmpArr);

          }
        }

        let columns = peptide_columns_base.slice();
        if (this.props.seqWidth) columns[2].headerStyle.width = this.props.seqWidth+"rem";
        if (this.props.data.length > 1) {
          // add peptide name column if available
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
  
            // insert at index 2
            columns.splice(2, 0, nameCol)
          }
  
          let file_data = this.props.data[0].data;
          if (file_data.length > 1) {
            // multiple files, add data columns and ratio columns
              let ratios = this.props.data[0].ratios
              let fileName0 = file_data[0].file.split("/").pop().split(".")[0].trim() + ' ';
              let fileName1 = file_data[1].file.split("/").pop().split(".")[0].trim() + ' ';
              for(let r in ratios) {
                  let col_name = this.props.data[0].columnDisplayNames[r];
                  columns.push({
                      dataField: 'ratios['+r+'][0]',
                      text: col_name + ' Ratio '+fileName0+" : "+fileName1,
                      sort: true,
                      sortFunc: sortNumerical
                    },{
                      dataField: 'ratios['+r+'][1]',
                      text: col_name + ' Ratio '+fileName1+" : "+fileName0,
                      hidden: true,
                      sort: true,
                      sortFunc: sortNumerical
                    });   
              }
  
              // file data, default state is hidden in table
              for (let i in file_data) {
                  let fileName = file_data[i].file.split("/").pop().split(".")[0].trim() + ' ';
                  for (let c in file_data[i].columns) {
                    let col_name = this.props.data[0].columnDisplayNames[c];
                    columns.push({
                      dataField: 'data['+i+'].columns['+c+']',
                      text: fileName+col_name,
                      hidden: true,
                      sort: true,
                      sortFunc: sortNumerical
                    })
                  }
              }
  
          } else {
            // single file, add data columns only
              for (let i in file_data) {
                  let fileName = file_data[i].file.split("/").pop().split(".")[0].trim() + ' ';

                  for (let c in file_data[i].columns) {
                    let col_name = this.props.data[0].columnDisplayNames[c];
                    columns.push({
                      dataField: 'data['+i+'].columns['+c+']',
                      text: fileName+col_name,
                      sort: true,
                      sortFunc: sortNumerical
                    })
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
                            <BootstrapTable 
                            rowEvents = { rowEvents } 
                            selectRow = { selectRow } 
                            { ...props.baseProps } 
                            caption={this.props.caption}
                            />
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
