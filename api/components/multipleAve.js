exports.aveData = async function aveData(our_json) {
    let numFileGivenSNR = 0;
    returner = [];
    our_json.forEach(pep => {
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
        returner.push({
            pepName: pep.proteinId,
            asa: pep.asa,
            gravy: pep.gravy,
            pI: pep.pI,
            peptideSeq: pep.peptideSeq,
            ss: pep.ss,
            aveSNR: aveSNR.toFixed(3),
            aveFM: aveFM.toFixed(3),
            snr:snr
        })
        
    })
    return returner;
}
