import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { peptide_columns_base } from './Table';
import '../App.css';

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

let epitope_columns_base = [{
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
},{
    dataField: 'peptideSeq',
    text: 'Sequence',
    sort: true,
    headerStyle: {
        width: "15rem",
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
    dataField: 'percentFiles',
    text: '% Samples Bound',
    sort: true,
    sortFunc: sortNumerical
  }
];


export class MultTablePeptide extends React.Component {
    render() {

        const selectRow = {
          mode: 'radio',
          clickToSelect: true,
          bgColor: '#00BFFF',
          hideSelectColumn: true,
          selected: this.props.selectedRows.map(s => s.peptideSeq),
          nonSelectable: this.props.data.peptides.filter(p => !p.res_id).map(p => p.peptideSeq)
        };

        const rowEvents = {
          onClick: (e, row, rowIndex) => {

            if (!row.res_id) return;

            let tmpArr = [];
            // Removes from array
            if (this.props.selectedRows.find(d => d.res_id === row.res_id)) {
              tmpArr.length = 0;
            } else {
              tmpArr.push(row);
            }

            this.props.setSelectedRows(tmpArr);

          }
        }

        let columns = peptide_columns_base.slice();
        if (this.props.seqWidth) columns[2].headerStyle.width = this.props.seqWidth+"rem";
        if (this.props.data.peptides.length > 0) {

          if (this.props.data.peptides[0].hasOwnProperty("proteinId") && this.props.data.peptides[0].proteinId) {
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

          for (let c in this.props.data.peptides[0].averages) {
            let col_name = this.props.data.peptides[0].columnDisplayNames[c];
            columns.push({
              dataField: 'averages['+c+']',
              text: "Average "+col_name,
              sort: true,
              sortFunc: sortNumerical
            })
          }
        }

        return (
          <ToolkitProvider
          keyField="peptideSeq"
          data={ this.props.data.peptides}
          columns={ columns }
          columnToggle
          exportCSV
          >
              {
                  props => (
                      <div>
                          <CustomToggleList { ...props.columnToggleProps }  />
                          <hr />
                          <BootstrapTable 
                          rowEvents = { rowEvents } 
                          selectRow = { selectRow }
                          { ...props.baseProps } 
                          caption="Peptide Information"
                          />
                          <hr />
                          <MyExportCSV { ...props.csvProps } caption="Peptide Information"/>
                          <hr />
                          <br />
                      </div>
                  )
              }
          </ToolkitProvider>
        );


        
    }
}

export class MultTableEpitope extends React.Component {
  render() {

      const selectRow = {
        mode: 'radio',
        clickToSelect: true,
        bgColor: '#00BFFF',
        hideSelectColumn: true,
        selected: this.props.selectedRows.map(s => s.peptideSeq),
        nonSelectable: this.props.data.epiData.filter(p => !p.res_id).map(p => p.peptideSeq)
      };

      const rowEvents = {
        onClick: (e, row, rowIndex) => {

          if (!row.res_id) return;

          let tmpArr = [];
          // Removes from array
          if (this.props.selectedRows.includes(row)) {
            tmpArr.length = 0;
          } else {
            tmpArr.push(row);
          }

          this.props.setSelectedRows(tmpArr);

        }
      }

      let epitopeCols = epitope_columns_base.slice();

      if (this.props.data.epiData.length > 0) {

        epitopeCols.push({
          dataField: 'minData',
          text: 'Minimum '+this.props.data.epiData[0].columnDisplayNames[config.epitopes.dataTypeColumnIndex],
          sort: true,
          sortFunc: sortNumerical
        });
        epitopeCols.push({
          dataField: 'maxData',
          text: 'Maximum '+this.props.data.epiData[0].columnDisplayNames[config.epitopes.dataTypeColumnIndex],
          sort: true,
          sortFunc: sortNumerical
        });

        for (let c in this.props.data.peptides[0].averages) {
          let col_name = this.props.data.epiData[0].columnDisplayNames[c];
          epitopeCols.push({
            dataField: 'averages['+c+']',
            text: "Average "+col_name,
            hidden: true,
            sort: true,
            sortFunc: sortNumerical
          })
        }
      }

      return (
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
                        <hr />
                        <CustomToggleList { ...props.columnToggleProps }  />
                        <hr />
                        <BootstrapTable 
                        rowEvents = { rowEvents } 
                        selectRow = { selectRow }
                        { ...props.baseProps } 
                        caption={"Epitope Information - # of samples: "+(this.props.data.peptides.length ? this.props.data.peptides[0].data.length : "-")}/>
                        <hr />
                        <MyExportCSV { ...props.csvProps } caption="Epitope Information"/>
                        <hr />
                        <br />
                    </div>
                )
            }
        </ToolkitProvider>
      );


      
  }
}
