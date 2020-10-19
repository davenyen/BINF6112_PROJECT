const fs = require('fs');
const Parse = require('./parseTwo');

exports.mapData = async function mapData(ma_json, pdbFile) {

    // const spawn = require("child_process").spawn;
    // var pythonProcess = spawn('python',['./dssp.py', pdbFile]);
    const exec = require('child_process').execSync;

    // pythonProcess.stdout.on('data', function(data) {
    //     console.log('here');
    // })
    let data = exec('python3 ./components/dssp.py '+pdbFile)
    console.log(data.toString());

    var dssp_json = JSON.parse(data.toString());
    // var dssp_json = JSON.parse(fs.readFileSync('./components/dssp.json'));
    // console.log(dssp_json);
    let sequence = dssp_json.sequence;

    // let ma_json = await Parse.parse(filePath);
    
    let mappedData = [];
    for (let peptide of ma_json) {
        let start = sequence.indexOf(peptide.peptideSeq);
        if (peptide.peptideSeq.length < 5) continue;
        if (start >= 0) {
            let asa = dssp_json.asa.slice(start, start + peptide.peptideSeq.length);
            let ss = dssp_json.ss.slice(start, start + peptide.peptideSeq.length);
            peptide.asa = asa.reduce((a, b) => a + b, 0)/getMaxASA(peptide.peptideSeq);
            // peptide.asa = rsa(asa, peptide.peptideSeq);
            peptide.ss = mode(ss);
            peptide.data[0].snr = Math.log2(peptide.data[0].rawMean) - Math.log2(peptide.data[0].backgroundMean);
            mappedData.push(peptide);
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

// Parse.parse('./ige.xlsx').then(json => {
//     this.mapData(json, '../public/3s7i.pdb');
// });