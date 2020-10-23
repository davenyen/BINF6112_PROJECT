import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
let order = 'desc';

export default class Table extends React.Component {
    handleBtnClick = () => {
        if (order === 'desc') {
          this.refs.table.handleSort('asc', 'name');
          order = 'asc';
        } else {
          this.refs.table.handleSort('desc', 'name');
          order = 'desc';
        }
      }
    constructor(props){
    super(props);
    this.getHeader = this.getHeader.bind(this);
    this.getFileHeader = this.getFileHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
    console.log(this.props.data[0])
    console.log(this.props.data)
    if (this.props.data[0] !== undefined) this.state = {ratio: this.props.data[0].hasOwnProperty("snr")};
    else this.state = {ratio: null}
    }
    
    getFileHeader = function() {
        // console.log(this.props.data);
        return(
            <tr>
                <th colSpan="4"></th>
                {this.state.ratio && <th colSpan="2">Foreground Median Ratio</th> }
                {this.state.ratio && <th colSpan="2">SNR Ratio</th> }
                {this.props.data[0].data.map((d) => {
                    let name = d.file.split("/").pop().split('.')[0].trim();
                    return (
                        <th colSpan="2" key={name}>{name}</th>
                    );
                })}
            </tr>
        );
    }
    
    getHeader = function(){

        // doesn't work for single files
        
        let ratioHeaders=[];
        if (this.state.ratio) {
            let name1 = this.props.data[0].data[0].file.split("/").pop().split('.')[0].trim();
            let name2 = this.props.data[0].data[1].file.split("/").pop().split('.')[0].trim();
            ratioHeaders.push(
            <th key="fmratio1">{name1+":"+name2}</th>,
            <th key="fmratio2">{name2+":"+name1}</th>,
            <th key="snrratio1">{name1+":"+name2}</th>,
            <th key="snrratio2">{name2+":"+name1}</th>
            );
        }
        
        let dataHeaders = [];
        this.props.data[0].data.forEach(d => dataHeaders.push(
            <th key={"foreground med"+d.file}>Foreground Median</th>,
            <th key={"snr"+d.file}>SNR</th>
        ));

        console.log(ratioHeaders)
        console.log(dataHeaders)

        return (
        <tr>
            <th>Protein ID</th>
            <th>Peptide Sequence</th>
            <th>Relative ASA</th>
            <th>Secondary Structure</th>
            {ratioHeaders}
            {dataHeaders}
        </tr>
        );
    }
    
    getRowsData = function(){
        var items = this.props.data;
        // var keys = this.state.keys;
        return items.map((row, index)=>{
            let dataCells = [];
            row.data.forEach(d => dataCells.push(
                <td key={d.foregroundMedian+d.file}>{d.foregroundMedian}</td>,
                <td key={d.snr+d.file}>{d.snr.toFixed(3)}</td>
            ));

            let ratioCells = [];
            if (this.state.ratio) {
                let ratioKeys = ["fmratio1", "fmratio2", "snrratio1", "snrratio2"];
                ratioKeys.forEach(key => 
                    ratioCells.push(
                    <td key={key}>{row[key] ? row[key].toFixed(3) : row[key]}</td>
                ));
            }

            return (
            <tr key={index}>
                <td>{row.proteinId}</td>
                <td>{row.peptideSeq}</td>
                <td>{row.asa.toFixed(3)}</td>
                <td>{row.ss}</td>
                {ratioCells}
                {dataCells}
            </tr>
            )
        });
    }

    // DataFormat => displays foregroundMedian
    displayFM = function(cell, row) {
        return cell[0].foregroundMedian;
    }

    // DataFormat => displays SNR
    displaySNR = function(cell, row) {
        return cell[0].snr;
    }

    // Manually sorts SNR
    sortSNR = function(a, b, sortOrder) {
        if (sortOrder === 'desc') {
            return a.data[0].snr > b.data[0].snr ? -1 : 1;
        } else {
            return a.data[0].snr > b.data[0].snr ? 1 : -1; 
        }
    }

    // Manually sorts foregroundMedian
    sortFM = function(a, b, sortOrder) {
        if (sortOrder === 'desc') {
            return a.data[0].foregroundMedian > b.data[0].foregroundMedian ? -1 : 1;
        } else {
            return a.data[0].foregroundMedian > b.data[0].foregroundMedian ? 1 : -1; 
        }
    }
    
    render() {
        return (
            <div>
            <p style={ { color: 'red' } }>You can click header to sort</p>
            <BootstrapTable ref='table' data={ this.props.data }>
                <TableHeaderColumn width="20%" dataField='proteinId' isKey={ true } dataSort={ true }>Protein ID</TableHeaderColumn>
                <TableHeaderColumn width="20%" dataField='peptideSeq' dataSort={ true }>Peptide Sequence</TableHeaderColumn>
                <TableHeaderColumn width="20%" dataField='asa' dataSort={ true }>Relative ASA</TableHeaderColumn>
                <TableHeaderColumn width="20%" dataField='ss' dataSort={ true }>Secondary Structure</TableHeaderColumn>
                <TableHeaderColumn 
                    width="20%" 
                    dataField='data' 
                    dataSort={true}
                    dataFormat={this.displayFM}
                    sortFunc={this.sortFM}>
                    Foreground Median
                </TableHeaderColumn>
                <TableHeaderColumn 
                    width="20%" 
                    dataField='data' 
                    dataSort
                    dataFormat={this.displaySNR}
                    sortFunc={this.sortSNR}>
                    SNR
                </TableHeaderColumn>
            </BootstrapTable>
          </div>
        );
    }
}
