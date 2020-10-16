import React from 'react';

export default class Table extends React.Component {
 
    constructor(props){
    super(props);
    this.getHeader = this.getHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
    this.state = {
        keys: ["proteinId", "peptideSeq", "foregroundMedian", "snr", "asa", "ss"]}
    }
    
    getHeader = function(){
        return (
        <tr>
            <th>Protein ID</th>
            <th>Peptide Sequence</th>
            <th>Foreground Median</th>
            <th>SNR</th>
            <th>Relative Accessible Surface Area</th>
            <th>Secondary Structure</th>
        </tr>
        );
    }
    
    getRowsData = function(){
        var items = this.props.data;
        var keys = this.state.keys;
        return items.map((row, index)=>{
            return <tr key={index}><RenderRow key={index} data={row} keys={keys}/></tr>
        });
    }
    
    render() {
        return (
            <div>
                <table>
                    <thead>{this.getHeader()}</thead>
                    <tbody>
                        {this.getRowsData()}
                    </tbody>
                </table>
            </div>
        );
    }
}

const RenderRow = (props) =>{
    return props.keys.map((key, index)=>{
        return <td key={props.data[key]}>{props.data[key]}</td>
    });
}