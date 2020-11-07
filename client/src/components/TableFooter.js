import React, { Component } from 'react';
import './css/TableFooter.css';

let config = require('../frontend_config.json');

export default class TableFooter extends Component {

    render() {
        return (
            <div className="table-footer">
                <b>Summary Table Fields</b>
                <table>
                    <col style={{width: "20%"}}/>
                    <col />
                    <tr>
                        <td>ID</td>
                        <td>Residue ID from DSSP output - position in protein structure that protein has been mapped to.</td>
                    </tr>
                    <tr>
                        <td>Relative ASA</td>
                        <td>Relative Accessible Surface Area (ASA) - the solvent accessible surface area (as calculated per residue 
                            by DSSP) relative to the maximum accessible surface area for the residue (as determined by 
                            <a href="https://doi.org/10.1002/prot.340200303" target="_blank"> Sander and Rost (1994)</a>). Relative ASA values
                            for peptides are calculated as the sum of the residues' ASA values, divided by the sum of the residues'
                            maximum ASA values - values lie between 0 and 1.
                            <br />
                            Relative ASA values below {config.bury_threshold} (configurable) are considered buried and are shaded grey.
                        </td>
                    </tr>
                    <tr>
                        <td>Secondary Structure</td>
                        <td>Secondary structures are assigned to residues by <a href="https://swift.cmbi.umcn.nl/gv/dssp/" target="_blank"> DSSP</a>.
                            Secondary structure for peptides is the mode of the residue assignments.
                        </td>
                    </tr>
                    <tr>
                        <td>GRAVY</td>
                        <td>Grand Average of Hydropathy - values are typically between -2 and +2, with positive values more hydrophobic.</td>
                    </tr>
                    <tr>
                        <td>Isoelectric Point</td>
                        <td>pH at which peptide carries no net electrical charge.</td>
                    </tr>
                    <tr>
                        <td>SNR Calculated</td>
                        <td>Signal to Noise Ratio calculated as log<sub>2</sub>(Raw Mean) − log<sub>2</sub>(Background Mean)</td>
                    </tr>
                </table>
                <br />
                <p>Binding data is smoothed for overlapping peptides, taking the 2 adjacent peptides overlapping on either side and weighting values by the identity shared with peptide in question.</p>
            </div>
        );
    }
}