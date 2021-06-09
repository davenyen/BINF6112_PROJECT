const fs = require('fs');
const Parse = require('./parse');
let config = require('../client/src/Config.json');
const dps = parseInt(config.decimal_places);

const exec = require('child_process').execSync;

exports.mapData = async function mapData(ma_json, pdbFile) {

    let data = exec('python3 ./components/dssp.py "'+pdbFile+'"')

    var dssp_json = JSON.parse(data.toString());
    let sequence = dssp_json.sequence;

    // SS bridge Cys location markers (marked by DSSP with lowercase letters) --> Cys residues
    sequence = sequence.replace(/[a-z]/g, "C");

    let pep_length = 0;
    for (let peptide of ma_json) {
        pep_length = peptide.peptideSeq.length;
        if (pep_length > 3) break;
    }
    
    ma_json = ma_json.filter(peptide => typeof peptide.peptideSeq === "string" && peptide.peptideSeq.length > parseInt(config.overlap.amount));
    let ma_json_raw = ma_json.slice();

    let proteins = groupOverlappingPeptides(ma_json);

    let matchingProtein = proteins.find(prot => prot.peptides.find(p => matchPeptide(sequence, p.peptideSeq) >= 0));
    console.log(`FOUND prot: ${matchingProtein.peptides[0].proteinId} sequence: ${matchingProtein.sequence}`)

    let chemprops_json = JSON.parse(exec('python3 ./components/chemprops.py '+ matchingProtein.sequence + " "+pep_length).toString());
    
    let mappedData = [];
    matchingProtein.peptides.forEach((peptide, ind) => {
        if (peptide.peptideSeq.length < 3) return;

        // find a mapping from the microarray peptide sequence to the protein sequence provided by structure
        let structureStart = matchPeptide(sequence, peptide.peptideSeq);
        if (structureStart >= 0) {
            let start = structureStart;
            // get accessible surface area (ASA) and secondary structure assignments for residues in peptide
            let asa = dssp_json.asa.slice(start, start + peptide.peptideSeq.length);
            let ss = dssp_json.ss.slice(start, start + peptide.peptideSeq.length);
            // Residue ID from dssp output
            peptide.res_id = dssp_json.res_id[start];

            // secondary structure - get mode of residue assignments
            peptide.asa = (asa.reduce((a, b) => a + b, 0)/getMaxASA(peptide.peptideSeq)).toFixed(dps);
            let mode_ss = mode(ss);
            peptide.ss = ssNames.hasOwnProperty(mode_ss) ? ssNames[mode_ss] : "-";
        }

        let groupedPepStart = matchingProtein.sequence.indexOf(peptide.peptideSeq);
        if (groupedPepStart >= 0) {
            // gravy and isoelectric point
            peptide.pI = chemprops_json.pI[groupedPepStart].toFixed(dps);
            peptide.gravy = chemprops_json.gravy[groupedPepStart].toFixed(dps);
        }

        let peptideSmoothed = smoothData(peptide, ma_json_raw);
        if (config.calculateSNR) {
            peptideSmoothed.columnDisplayNames.push("Calculated SNR");
        }

        peptideSmoothed.id = ind + 1;

        mappedData.push(peptideSmoothed);
    })

    mappedData = calculateRatios(mappedData);

    jsonObj = {};
    jsonObj.peptides = mappedData;
    
    jsonObj.epitopesByFile = getEpitopes(mappedData, dssp_json, sequence);
    return jsonObj;
}

// /* Randomize array in-place using Durstenfeld shuffle algorithm */
// function shuffleArray(array) {
//     for (var i = array.length - 1; i > 0; i--) {
//         var j = Math.floor(Math.random() * (i + 1));
//         var temp = array[i];
//         array[i] = array[j];
//         array[j] = temp;
//     }
// }

// separate the overlapping peptides by the protein they are part of
// proteins separated by a linker sequence (in config) 
function groupOverlappingPeptides(ma_json) {

    // shuffleArray(ma_json);

    let peps = ma_json.map(peptide => ({sequence: peptide.peptideSeq, peptides: [peptide]}));
    
    // need:
    // overlap of 1 (or less than 3?) included
    // for ends: after finding which protein matches sequence, find overlaps from sequences with linkers

    let frontLinkerRegex = new RegExp(`.+${config.linker_sequence}.*`);
    let backLinkerRegex = new RegExp(`.*${config.linker_sequence}.+`)

    let changeOccurred = true;
    while (changeOccurred) {
        changeOccurred = false;
        let i = 0;
        while (i < peps.length) {
            let prot = peps[i];
            let existingSeq =  prot.sequence;
            let overlap = prot.peptides[0].peptideSeq.length - parseInt(config.overlap.amount);

            let newPeptideAfter = peps.find(p => existingSeq.slice(-overlap) === p.sequence.slice(0, overlap));
            if (newPeptideAfter) {
                if (!newPeptideAfter.sequence.match(backLinkerRegex)) {
                    // push new peptide objects and add new peptide onto sequence
                    prot.peptides = [...prot.peptides, ...newPeptideAfter.peptides];
                    prot.sequence = prot.sequence + newPeptideAfter.sequence.slice(overlap);

                    // remove newPeptideAfter from list
                    peps = peps.filter(item => item !== newPeptideAfter);
                    changeOccurred = true;
                }
            } else {
                let newPeptideBefore = peps.find(p => p.sequence.slice(-overlap) === existingSeq.slice(0, overlap));
                if (newPeptideBefore) {
                    if (!newPeptideBefore.sequence.match(frontLinkerRegex)) {
                        // add peptides from prot to newPeptideBefore and add sequence
                        newPeptideBefore.peptides = [...newPeptideBefore.peptides, ...prot.peptides]
                        newPeptideBefore.sequence = newPeptideBefore.sequence + prot.sequence.slice(overlap);

                        // remove prot from list
                        peps = peps.filter(item => item !== prot);
                        i--; // decrement as current item deleted
                        changeOccurred = true;
                    }
                }
            }
            i++;
        }
    }

    peps.forEach(p => console.log(`prot: ${p.peptides[0].proteinId} sequence: ${p.sequence}`));
    return peps;
}

function matchPeptide(sequence, peptide) {
    let start = sequence.indexOf(peptide);
    if (start >= 0) return start;

    if (sequence.match("X")) {
        sequence = sequence.replace(/X/g, ".");
        for (let i = 0; i < sequence.length - peptide.length; i++) {
            if (peptide.match(new RegExp(sequence.substring(i, i + peptide.length)))) {
                return i;
            }
        }
    }

    if (sequence.match("B")) {
        peptide = peptide.replace(/D/, "(D|B)");
        peptide = peptide.replace(/N/, "(N|B)");
    }

    if (sequence.match("Z")) {
        peptide = peptide.replace(/E/, "(E|Z)");
        peptide = peptide.replace(/Q/, "(Q|Z)");
    }

    if (sequence.match("J")) {
        peptide = peptide.replace(/I/, "(I|J)");
        peptide = peptide.replace(/L/, "(L|J)");
    }

    return sequence.search(new RegExp(peptide));
}

function getEpitopes(peptides, dssp_json, full_sequence) {
    // peptides.sort((a, b) => a.res_id - b.res_id); // peptides already sorted according to microarray data overlaps

    let dataInd = config.epitopes.dataTypeColumnIndex;
    let dataThreshold = parseFloat(config.epitopes.threshold);
    let incThreshold = parseFloat(config.epitopes.relativeIncludeThreshold);

    let epitope_json = {};
    if (!peptides[0] || !peptides[0].data) return epitope_json;
    // loop through each file
    for (let d in peptides[0].data) {
        
        let epitopes = peptides.map((p, ind) => {
            if (!(ind !== 0 && ind !== peptides.length - 1 &&
                // has overlapping peptides on either side
                // p.res_id - peptides[ind - 1].res_id === config.overlap.amount && 
                // peptides[ind + 1].res_id - p.res_id === config.overlap.amount &&
    
                // local maxima with foreground median
                parseFloat(p.data[d].columns[dataInd]) > parseFloat(peptides[ind - 1].data[d].columns[dataInd]) &&
                parseFloat(p.data[d].columns[dataInd]) > parseFloat(peptides[ind + 1].data[d].columns[dataInd]) &&
    
                // foreground median above configured threshold
                parseFloat(p.data[d].columns[dataInd]) >  dataThreshold)) return null;

                
            let seq = p.peptideSeq;
            let pos = p.res_id;
            let id = p.id;

            if (parseFloat(peptides[ind - 1].data[d].columns[dataInd]) > dataThreshold
                && parseFloat(peptides[ind - 1].data[d].columns[dataInd]) > incThreshold * p.data[d].columns[dataInd]) {
                seq = peptides[ind-1].peptideSeq.slice(0, config.overlap.amount) + seq;
                // pos = peptides[ind-1].res_id;
            }

            if (parseFloat(peptides[ind + 1].data[d].columns[dataInd]) > dataThreshold
                && parseFloat(peptides[ind + 1].data[d].columns[dataInd]) > incThreshold * p.data[d].columns[dataInd]) {
                seq = seq + peptides[ind+1].peptideSeq.slice(-config.overlap.amount);
            }

            let e = {};
            e.peptideSeq = seq;
            e.res_id = pos;
            e.id = id;

            let start = full_sequence.indexOf(seq);
            if (start >= 0) {
                // get accessible surface area (ASA) and secondary structure assignments for residues in peptide
                let asa = dssp_json.asa.slice(start, start + seq.length);
                let ss = dssp_json.ss.slice(start, start + seq.length);
    
                // secondary structure - get mode of residue assignments
                e.asa = (asa.reduce((a, b) => a + b, 0)/getMaxASA(seq)).toFixed(dps);
                let mode_ss = mode(ss);
                e.ss = ssNames.hasOwnProperty(mode_ss) ? ssNames[mode_ss] : "-";
            }

            e.data = [];
            e.data.push(p.data[d]);
            e.columnDisplayNames = p.columnDisplayNames;
            
            return e;
        });

        epitopes = epitopes.filter(p => p !== null);

        let sequences = epitopes.map(p => p.peptideSeq);
        sequences = sequences.join(",");

        if (sequences) {
            let chemprops_json = JSON.parse(exec('python3 ./components/chemprops_epitopes.py '+ sequences));
            epitopes = epitopes.map((e, ind) => {
                e.gravy = chemprops_json.gravy[ind].toFixed(dps);
                e.pI = chemprops_json.pI[ind].toFixed(dps);
                return e;
            })

        }
    
        epitope_json[peptides[0].data[d].file] = epitopes;
    }

    return epitope_json;
}

function smoothData(peptideRaw, ma_json) {
    let snrIncluded = !isNaN(peptideRaw.data[0].snr);
    let peptide = JSON.parse(JSON.stringify(peptideRaw));
    if (!snrIncluded) peptide.data.forEach(d => d.snr = NaN);

    let overlap = parseInt(peptide.peptideSeq.length - config.overlap.amount);
    let pBefore = ma_json.find(p => p.peptideSeq.slice(-overlap) === peptide.peptideSeq.slice(0, overlap));
    let pAfter = ma_json.find(p => peptide.peptideSeq.slice(-overlap) === p.peptideSeq.slice(0, overlap));

    // iterate over files
    for (let d in peptide.data) {

        for (let c in peptide.data[d].columns) {
            total_weight = config.overlap.weightCurr;

            av = peptide.data[d].columns[c] * config.overlap.weightCurr;

            if (pBefore) {
                let p = pBefore;
                av += p.data[d].columns[c] * config.overlap.weightPrev;
                total_weight += config.overlap.weightPrev;
            }

            if (pAfter) {
                let p = pAfter;
                av += p.data[d].columns[c] * config.overlap.weightNext;
                total_weight += config.overlap.weightNext;
            }

            peptide.data[d].columns[c] = av/total_weight;

        }

        if (config.calculateSNR) {
            total_weight = config.overlap.weightCurr;

            av = calculateSNR(peptide.data[d]) * config.overlap.weightCurr;

            if (pBefore) {
                let p = pBefore;
                av += calculateSNR(p.data[d]) * config.overlap.weightPrev;
                total_weight += config.overlap.weightPrev;
            }

            if (pAfter) {
                let p = pAfter;
                av += calculateSNR(p.data[d]) * config.overlap.weightNext;
                total_weight += config.overlap.weightNext;
            }

            peptide.data[d].columns.push(av/total_weight);
        }

    }
    return peptide;
}

function calculateSNR(peptideData) {
    return Math.log2(peptideData.rawMean) - Math.log2(peptideData.backgroundMean);
}

function calculateRatios(mappedData) {

    mappedData = mappedData.map(peptide => {
        // calculate SNR
        for (let d of peptide.data) {
            for (let c in d.columns) {
                d.columns[c] = d.columns[c].toFixed(dps);
            }
        }

        // Calculate ratios if two files provided
        if (peptide.data.length == 2) {
            peptide.ratios = [];

            for (let c in peptide.data[0].columns) {
                let ratio1 = peptide.data[0].columns[c]/peptide.data[1].columns[c];
                ratio1 = (!isNaN(ratio1)) ? (ratio1).toFixed(dps) : "-";
                let ratio2 = peptide.data[1].columns[c]/peptide.data[0].columns[c];
                ratio2 = (!isNaN(ratio2)) ? (ratio2).toFixed(dps) : "-";
                peptide.ratios.push( [ratio1, ratio2 ]);
            }
        }

        return peptide;
    });

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