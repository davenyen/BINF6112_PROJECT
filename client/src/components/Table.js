import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { ColumnToggle } from 'react-bootstrap-table2-toolkit';
// DataFormat => displays foregroundMedian
function displayFM(cell, row) {
    return cell[0].foregroundMedian;
}

// DataFormat => displays SNR
function displaySNR(cell, row) {
    return cell[0].snr;
}

// Manually sorts SNR
function sortSNR(a, b, sortOrder) {
    if (sortOrder === 'desc') {
        return a[0].snr > b[0].snr ? -1 : 1;
    } else {
        return a[0].snr > b[0].snr ? 1 : -1; 
    }
}

// Manually sorts foregroundMedian
function sortFM(a, b, sortOrder) {
    if (sortOrder === 'desc') {
        return a[0].foregroundMedian > b[0].foregroundMedian ? -1 : 1;
    } else {
        return a[0].foregroundMedian > b[0].foregroundMedian ? 1 : -1; 
    }
}

const { ToggleList } = ColumnToggle;

const columns = [{
    dataField: 'proteinId',
    text: 'Protein ID',
    sort: true
  }, {
    dataField: 'peptideSeq',
    text: 'Peptide Sequence',
    sort: true
  },{
    dataField: 'asa',
    text: 'Relative ASA',
    sort: true
  }, {
    dataField: 'ss',
    text: 'Secondary Structure',
    sort: true
  },{
    dataField: 'data',
    text: 'Foreground Median',
    sort: true,
    formatter: displayFM,
    sortFunc: sortFM
  },{
    dataField: 'data',
    text: 'SNR',
    sort: true,
    formatter: displaySNR,
    sortFunc: sortSNR
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


export default class Table extends React.Component {
    constructor(props){
    super(props);
    console.log(this.props.data[0])
    console.log(this.props.data)
    if (this.props.data[0] !== undefined) this.state = {ratio: this.props.data[0].hasOwnProperty("snr")};
    else this.state = {ratio: null}
    }

    render() {
        return (
            <ToolkitProvider
            keyField="proteinID"
            data={ this.props.data }
            columns={ columns }
            columnToggle
            exportCSV
            >
                {
                    props => (
                        <div>
                            <MyExportCSV { ...props.csvProps } />
                            <hr />
                            <ToggleList { ...props.columnToggleProps } />
                            <hr />
                            <BootstrapTable { ...props.baseProps } />
                        </div>
                    )
                }
            </ToolkitProvider>
        );
    }
}