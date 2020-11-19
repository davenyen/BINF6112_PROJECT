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
        r[a.res_id] = r[a.res_id] || [];
        r[a.res_id].push(a);
        return r;
    }, Object.create({}))
    /*Object.keys(epitopeResIdSorted).forEach(key =>{
            epitopeResIdSorted[key].forEach(data =>{
                 console.log(data.data,"THis is the data object")
     })
    })*/
    let numFileGivenSNR = 0;
    returner = {}
    peptidedata = []
    epitopeData = []
    our_json.peptides.forEach(pep => {
        let aveSNR = 0, aveFM = 0;snr=0;
        let averages = new Array(pep.data[0].columns.length).fill(0);
        pep.data.forEach(pepData => {
            for (let c in pepData.columns) {
                averages[c] += parseFloat(pepData.columns[c]);
            }
            // aveSNR = aveSNR + parseFloat(pepData.SNR_Calculated)
            // aveFM = aveFM + parseFloat(pepData.foregroundMedian)
            // if(!(isNaN(parseFloat(pepData.snr)))){
            //     numFileGivenSNR++;
            //     snr = snr + parseFloat(pepData.snr) 
            // }
        })
        // numFileGivenSNR > 0 ? snr = (snr/numFileGivenSNR).toFixed(dps) : snr=NaN
        // aveSNR = aveSNR / pep.data.length
        // aveFM = aveFM / pep.data.length

        for (let c in pep.data[0].columns) {
            averages[c] = (averages[c] / pep.data.length).toFixed(dps);
        }

        pep.averages = averages;
        // pep.snr = snr;
        // pep.aveSNR = aveSNR.toFixed(3);
        // pep.aveFM = aveFM.toFixed(3);
        peptidedata.push(pep);
    })

    Object.keys(epitopeResIdSorted).forEach(res =>{
        //Variables for final Array of Objects
        let ps = ""; let pi = "";let rm =0;let bm=0; let fm=0; let sr=0; let srfl=0; 
        let max_data = NaN; let min_data = NaN; let ss = "";let asa =0;let gravy=0;
        let pI=0;let minlength = 1000000; let src=0; let res_id =0;

        let averages = new Array(epitopeResIdSorted[res]).fill(0);
        epitopeResIdSorted[res].forEach(resEpitope =>{
            //Below loop should always run once 
            resEpitope.data.forEach(data =>{
                // rm += parseFloat(data.rawMean);
                // bm += parseFloat(data.backgroundMean);
                for (let c in data.columns) {
                    averages[c] += parseFloat(data.columns[c]);
                }
                // fm += parseFloat(data.foregroundMedian);
                // src += parseFloat(data.SNR_Calculated);
                // if(data.snr !== undefined && (!isNaN(parseFloat(data.snr)) && (parseFloat(data.snr) != null))){
                //     if(srfl == 0){sr += parseFloat((data.snr))}
                // }else{sr=NaN;srfl=1;}


                if(isNaN(max_data) || parseFloat(data.columns[epitopeDataInd]) > max_data){
                    max_data = parseFloat(data.columns[epitopeDataInd]);
                }
                // else{
                //     if(parseFloat(data.foregroundMedian) > max_fm){  max_fm = parseFloat(data.foregroundMedian)}
                // }
    
                if(isNaN(min_data) || parseFloat(data.columns[epitopeDataInd]) > min_data){
                    min_data = parseFloat(data.columns[epitopeDataInd]);
                }

                // if(isNaN(min_fm)){
                //     min_fm = parseFloat(data.foregroundMedian);
                // }else{
                //     if(parseFloat(data.foregroundMedian) < min_fm){  min_fm = parseFloat(data.foregroundMedian)}
                // }
            })

            if(resEpitope.peptideSeq.length < minlength){
                ps=resEpitope.peptideSeq;
                ss = resEpitope.ss;
                asa=resEpitope.asa;
                gravy=resEpitope.gravy;
                pI=resEpitope.pI;
                minlength = resEpitope.peptideSeq.length;
                res_id = resEpitope.res_id;
            }
        })

        // for (let c in )
        rm = rm/epitopeResIdSorted[res].length;
        bm = bm/epitopeResIdSorted[res].length;
        fm = fm/epitopeResIdSorted[res].length;
        src = src/epitopeResIdSorted[res].length;
        if(srfl!=1){sr = sr/epitopeResIdSorted[res].length;}

        for (let c in averages) {
            averages[c] = (averages[c]/totalFiles).toFixed(dps);
        }

        let percent = ((epitopeResIdSorted[res].length)/totalFiles)*100
        epitopeData.push({
            res_id: res_id,
            peptideSeq: ps, 
            // rawMean: rm,
            // backgroundMean: bm,
            // foregroundMedian: fm.toFixed(dps),
            // snr:sr.toFixed(dps),
            // snrC:src.toFixed(dps),
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
    console.log(epitopeData)
    returner.pepData = peptidedata
    returner.epiData = epitopeData
    return returner;
}