import React from 'react';

export default class Table extends React.Component {
 
    constructor(props){
    super(props);
    this.getHeader = this.getHeader.bind(this);
    this.getFileHeader = this.getFileHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
    }
    
    getFileHeader = function() {
        // console.log(this.props.data);
        return(
            <tr>
                <th colSpan="4"></th>
                {this.props.data[0].data.map((d) => {
                    let name = d.file.split("/").pop();
                    return (
                        <th colSpan="2" key={name}>{name}</th>
                    );
                })}
            </tr>
        );
    }
    
    getHeader = function(){
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

            return (
            <tr key={index}>
                <td>{row.proteinId}</td>
                <td>{row.peptideSeq}</td>
                <td>{row.asa.toFixed(3)}</td>
                <td>{row.ss}</td>
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
