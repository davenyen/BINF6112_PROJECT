import React from 'react';
import Table from './Table';

export default class EpitopeTable extends React.Component {

    render() {
        let tables = [];
        for (let file in this.props.data) {
            tables.push(
            <div key={file}>
                <Table 
                    data={this.props.data[file]} 
                    caption={file.split("/").pop().split(".")[0].trim() + " Epitopes"}
                    seqWidth={16}
                    setSelectedRows={this.props.setSelectedRows}
                    selectedRows={this.props.selectedRows}
                />
            </div>);
        }

        return <div>{tables}</div>;
    }
}
