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
        pep.data.forEach(pepData => {
            aveSNR = aveSNR + parseFloat(pepData.SNR_Calculated)
            aveFM = aveFM + parseFloat(pepData.foregroundMedian)
            if(!(isNaN(parseFloat(pepData.snr)))){
                numFileGivenSNR++;
                snr = snr + parseFloat(pepData.snr) 
            }
        })
        numFileGivenSNR > 0 ? snr = (snr/numFileGivenSNR).toFixed(3) : snr=NaN
        aveSNR = aveSNR / pep.data.length
        aveFM = aveFM / pep.data.length
        peptidedata.push({
            pepName: pep.proteinId,
            asa: pep.asa,
            gravy: pep.gravy,
            pI: pep.pI,
            peptideSeq: pep.peptideSeq,
            ss: pep.ss,
            aveSNR: aveSNR.toFixed(3),
            aveFM: aveFM.toFixed(3),
            snr:snr,
            res_id: pep.res_id
        })
    })

    Object.keys(epitopeResIdSorted).forEach(res =>{
        //Variables for final Array of Objects
        let ps = ""; let pi = "";let rm =0;let bm=0; let fm=0; let sr=0; let srfl=0; 
        let max_fm = NaN; let min_fm = NaN; let ss = "";let asa =0;let gravy=0;
        let pI=0;let minlength = 1000000; let src=0; let res_id =0;

        epitopeResIdSorted[res].forEach(resEpitope =>{
            //Below loop should always run once 
            resEpitope.data.forEach(data =>{
                rm += parseFloat(data.rawMean);
                bm += parseFloat(data.backgroundMean);
                fm += parseFloat(data.foregroundMedian);
                src += parseFloat(data.SNR_Calculated);
                if(data.snr !== undefined && (!isNaN(parseFloat(data.snr)) && (parseFloat(data.snr) != null))){
                    if(srfl == 0){sr += parseFloat((data.snr))}
                }else{sr=NaN;srfl=1;}
                if(isNaN(max_fm)){
                    max_fm = parseFloat(data.foregroundMedian);
                }else{
                    if(parseFloat(data.foregroundMedian) > max_fm){  max_fm = parseFloat(data.foregroundMedian)}
                }
    
                if(isNaN(min_fm)){
                    min_fm = parseFloat(data.foregroundMedian);
                }else{
                    if(parseFloat(data.foregroundMedian) < min_fm){  min_fm = parseFloat(data.foregroundMedian)}
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
            }
        })
        rm = rm/epitopeResIdSorted[res].length;
        bm = bm/epitopeResIdSorted[res].length;
        fm = fm/epitopeResIdSorted[res].length;
        src = src/epitopeResIdSorted[res].length;
        if(srfl!=1){sr = sr/epitopeResIdSorted[res].length;}
        let percent = ((epitopeResIdSorted[res].length)/totalFiles)*100
        epitopeData.push({
            res_id: res_id,
            peptideSeq: ps, 
            rawMean: rm,
            backgroundMean: bm,
            foregroundMedian: fm.toFixed(3),
            snr:sr.toFixed(3),
            snrC:src.toFixed(3),
            ss:ss,
            asa:asa,
            gravy:gravy,
            pI:pI,
            maxFm:max_fm,
            minFm:min_fm,
            percentFiles:percent.toFixed(3)
        })
    })
    //console.log(epitopeData)
    returner.pepData = peptidedata
    returner.epiData = epitopeData
    return returner;
}