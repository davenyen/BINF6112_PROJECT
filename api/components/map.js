const fs = require('fs');
const Parse = require('./parseTwo');
const dps = 3;

exports.mapData = async function mapData(ma_json, pdbFile) {

    // const spawn = require("child_process").spawn;
    // var pythonProcess = spawn('python',['./dssp.py', pdbFile]);
    const exec = require('child_process').execSync;

    // pythonProcess.stdout.on('data', function(data) {
    //     console.log('here');
    // })
    let data = exec('python3 ./components/dssp.py '+pdbFile)

    var dssp_json = JSON.parse(data.toString());
    let sequence = dssp_json.sequence;
    // replace ambiguous aa codes so GRAVY won't throw key error
    sequence = sequence.replace(/[a-z]/g, "C");
    // Asp or Asn -> 
    sequence = sequence.replace(/B/g, "N");
    sequence = sequence.replace(/Z/g, "Q");
    sequence = sequence.replace(/J/g, "L");

    let pep_length = 0;
    for (let peptide of ma_json) {
        pep_length = peptide.peptideSeq.length;
        if (pep_length > 3) break;
    }
    let chemprops_json = JSON.parse(exec('python3 ./components/chemprops.py '+ sequence.toUpperCase() + " "+pep_length).toString());
    
    let mappedData = [];
    for (let peptide of ma_json) {
        if (peptide.peptideSeq.length < 3) continue;
        let start = sequence.indexOf(peptide.peptideSeq);
        if (start >= 0) {
            // get accessible surface area (ASA) and secondary structure assignments for residues in peptide
            let asa = dssp_json.asa.slice(start, start + peptide.peptideSeq.length);
            let ss = dssp_json.ss.slice(start, start + peptide.peptideSeq.length);
            // Residue ID from dssp output
            peptide.res_id = dssp_json.res_id[start];

            // secondary structure - get mode of residue assignments
            peptide.asa = (asa.reduce((a, b) => a + b, 0)/getMaxASA(peptide.peptideSeq)).toFixed(dps);
            let mode_ss = mode(ss);
            peptide.ss = ssNames.hasOwnProperty(mode_ss) ? ssNames[mode_ss] : "-";

            // gravy and isoelectric point
            peptide.pI = chemprops_json.pI[start].toFixed(dps);
            peptide.gravy = chemprops_json.gravy[start].toFixed(dps);

            // calculate SNR
            for (let d in peptide.data) {
                peptide.data[d].SNR_Calculated = Math.log2(peptide.data[d].rawMean) - Math.log2(peptide.data[d].backgroundMean);
                peptide.data[d].SNR_Calculated = peptide.data[d].SNR_Calculated.toFixed(dps);
                if (peptide.data[d].hasOwnProperty("snr")) {
                    peptide.data[d].snr = peptide.data[d].snr.toFixed(3)
                }
            }

            // Calculate ratios if two files provided
            if (peptide.data.length == 2) {
                peptide.ratios = {};

                let ratio1 = peptide.data[0].foregroundMedian/peptide.data[1].foregroundMedian;
                ratio1 = (!isNaN(ratio1)) ? (ratio1).toFixed(dps) : "-";
                let ratio2 = peptide.data[1].foregroundMedian/peptide.data[0].foregroundMedian;
                ratio2 = (!isNaN(ratio2)) ? (ratio2).toFixed(dps) : "-";
                peptide.ratios.foregroundMedian = [
                    ratio1,
                    ratio2
                ]


                ratio1 = peptide.data[0].SNR_Calculated/peptide.data[1].SNR_Calculated;
                ratio1 = (!isNaN(ratio1)) ? (ratio1).toFixed(dps) : "-";
                ratio2 = peptide.data[1].SNR_Calculated/peptide.data[0].SNR_Calculated;
                ratio2 = (!isNaN(ratio2)) ? (ratio2).toFixed(dps) : "-";

                peptide.ratios.SNR_Calculated = [
                    (peptide.data[0].SNR_Calculated/peptide.data[1].SNR_Calculated).toFixed(dps),
                    (peptide.data[1].SNR_Calculated/peptide.data[0].SNR_Calculated).toFixed(dps)
                ]
            }
            
            
            mappedData.push(peptide);
            console.log(peptide);
        }
    }
    // console.log(mappedData);
    return mappedData;
}

function mode(array) {
    let map = {};
    for (let elem of array) {
        if(!map[elem]) {
            map[elem] = 0;
        }
        map[elem]++;
    }
    let max = Object.keys(map).reduce((a, b) => (map[a] > map[b] ? a : b));
    return max;
}

function getMaxASA(peptideSeq) {
    let sum = 0;
    for(let aa of peptideSeq) {
        sum += maxASA[aa];
    }
    return sum
}

// function rsa(asa, peptideSeq) {
//     let sum = 0;
//     for (let i = 0; i < peptideSeq.length; i++) {
//         sum += asa[i]/maxASA[peptideSeq[i]];
//     }
//     // average rsa over residues 
//     return sum/peptideSeq.length;
// }


// Sander and Rost 1994 (same as biopython default)
maxASA = {
    "A": 106,
    "B": 160,
    "C": 135,
    "D": 163,
    "E": 194,
    "F": 197,
    "G": 84,
    "H": 184,
    "I": 169,
    "K": 205,
    "L": 164,
    "M": 188,
    "N": 157,
    "P": 136,
    "Q": 198,
    "R": 248,
    "S": 130,
    "T": 142,
    "V": 142,
    "W": 227,
    "X": 180,
    "Y": 222,
    "Z": 196
}

ssNames = {
    "-": "-",
    "H": "α-helix",
    "B": "Residues in isolated β-bridge",
    "E": "β-ladder",
    "G": "3-helix",
    "I": "5-helix",
    "T": "H-bonded turn",
    "S": "Bend"
}

// Parse.parse('./ige.xlsx').then(json => {
//     this.mapData(json, '../public/3s7i.pdb');
// });