let config = require('../client/src/Config.json');
const dps = parseInt(config.decimal_places);
const epitopeDataInd = config.epitopes.dataTypeColumnIndex;

exports.aveData = async function aveData(our_json) {
    console.log("START")
    allEpitopes = [];
    for (let key in our_json.epitopesByFile) {
        allEpitopes.push(...our_json.epitopesByFile[key])
    }
    let totalFiles = Object.keys(our_json.epitopesByFile).length
    const epitopeResIdSorted = allEpitopes.reduce((r, a) => {
        r[a.id] = r[a.id] || [];
        r[a.id].push(a);
        return r;
    }, Object.create({}))
    
    let returner = {}
    let peptidedata = []
    let epitopeData = []
    our_json.peptides.forEach(pep => {

        let averages = new Array(pep.data[0].columns.length).fill(0);
        pep.data.forEach(pepData => {
            for (let c in pepData.columns) {
                averages[c] += parseFloat(pepData.columns[c]);
            }
        })

        for (let c in pep.data[0].columns) {
            averages[c] = (averages[c] / pep.data.length).toFixed(dps);
        }

        pep.averages = averages;
        peptidedata.push(pep);
    })

    Object.keys(epitopeResIdSorted).forEach(res =>{
        //Variables for final Array of Objects
        let ps = ""; 
        let max_data = NaN; let min_data = NaN; let ss = "";let asa =0;let gravy=0;
        let pI=0;let minlength = 1000000; let res_id =0;

        let averages = new Array(epitopeResIdSorted[res][0].data[0].columns.length).fill(0);
        epitopeResIdSorted[res].forEach(resEpitope =>{
            //Below loop should always run once 
            resEpitope.data.forEach(data =>{
                for (let c in data.columns) {
                    averages[c] += parseFloat(data.columns[c]);
                }


                if(isNaN(max_data) || parseFloat(data.columns[epitopeDataInd]) > max_data){
                    max_data = parseFloat(data.columns[epitopeDataInd]);
                }
    
                if(isNaN(min_data) || parseFloat(data.columns[epitopeDataInd]) < min_data){
                    min_data = parseFloat(data.columns[epitopeDataInd]);
                }
            })

            if(resEpitope.peptideSeq.length < minlength){
                ps=resEpitope.peptideSeq;
                ss = resEpitope.ss;
                asa=resEpitope.asa;
                gravy=resEpitope.gravy;
                pI=resEpitope.pI;
                minlength = resEpitope.peptideSeq.length;
                res_id = resEpitope.res_id;
                id = resEpitope.id;
            }
        })

        for (let c in averages) {
            averages[c] = (averages[c]/epitopeResIdSorted[res].length).toFixed(dps);
        }

        let percent = ((epitopeResIdSorted[res].length)/totalFiles)*100
        epitopeData.push({
            res_id: res_id,
            id: id,
            peptideSeq: ps, 
            averages: averages,
            columnDisplayNames: allEpitopes[0].columnDisplayNames,
            ss:ss,
            asa:asa,
            gravy:gravy,
            pI:pI,
            maxData:max_data.toFixed(dps),
            minData:min_data.toFixed(dps),
            percentFiles: Math.round(percent)
        })
    })

    returner.peptides = peptidedata
    returner.epiData = epitopeData
    return returner;
}