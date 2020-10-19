import React from 'react';

export default class Table extends React.Component {
 
    constructor(props){
    super(props);
    this.getHeader = this.getHeader.bind(this);
    this.getFileHeader = this.getFileHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
    this.state = {ratio: this.props.data[0].hasOwnProperty("fmratio1")};
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
    
    render() {
        return (
            <div>
                <table>
                    <thead>
                        {this.getFileHeader()}
                        {this.getHeader()}
                    </thead>
                    <tbody>
                        {this.getRowsData()}
                    </tbody>
                </table>
            </div>
        );
    }
}
