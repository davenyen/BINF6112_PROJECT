const xlsxFile = require('read-excel-file/node');

var start = exports.parse = async function parseData(file_path){

const rows = await xlsxFile(file_path);
MicroArrData = new Array();

for(let i = 0; i < rows.length; i++){
    MicroArrData.push({ 
        peptideSeq: undefined,
        proteinId:undefined,
        rawMean:undefined,
        backgroundMean:undefined,
        foregroundMedian:undefined
    })
}

for(i in rows){
    for(j in rows[i]){
        if(rows[i][j]!=null){
            if(String(rows[i][j]) == "Peptide"){
                let iter = 0;
                for(let row=Number(i)+1;row<rows.length; row++){
                    MicroArrData[iter].peptideSeq = rows[row][j]
                    iter++;
                }
            }else if(String(rows[i][j]) == "Antigen/Protein ID"){
                let iter=0;
                for(let row=Number(i)+1;row<rows.length; row++){
                    MicroArrData[iter].proteinId = rows[row][j]
                    iter++;
                 }
            }else if(String(rows[i][j]).match(/Raw Mean/g)){
                let iter=0;
                for(let row=Number(i)+1;row<rows.length; row++){
                    MicroArrData[iter].rawMean = rows[row][j]
                    iter++;
                 }
            }else if(String(rows[i][j]).match(/Background Mean/g)){
                let iter=0;
                for(let row=Number(i)+1;row<rows.length; row++){
                    MicroArrData[iter].backgroundMean = rows[row][j]
                    iter++;
                 }
            }else if(String(rows[i][j]).match(/Foreground Median/g)){
                let iter=0;
                for(let row=Number(i)+1;row<rows.length; row++){
                    MicroArrData[iter].foregroundMedian = rows[row][j]
                    iter++;
                 }
            }
        }
    }
}

//UnAveraged data in cleanedMad
const cleanedMad = MicroArrData.filter(data => data.peptideSeq != undefined)

//Averaging starts here
const duplicatesort = cleanedMad.reduce((r, a) => {
    r[a.proteinId] = r[a.proteinId] || [];
    r[a.proteinId].push(a);
    return r;
}, Object.create({}));

//Variable holding final Averaged data
const tripleAveragedData = [];

Object.keys(duplicatesort).forEach(key =>{
    let ps = ""; let pi = "";let rm =0;let bm=0; let fm=0; 
    duplicatesort[key].forEach(data =>{
        rm += data.rawMean;
        bm += data.backgroundMean;
        fm += data.foregroundMedian;
        ps = data.peptideSeq;
        pi = data.proteinId;
    })
    rm = rm/duplicatesort[key].length;
    bm = bm/duplicatesort[key].length;
    fm = fm/duplicatesort[key].length;
    tripleAveragedData.push({
        peptideSeq: ps,
        proteinId: pi,
        rawMean: rm,
        backgroundMean: bm,
        foregroundMedian: fm
    })


})

return tripleAveragedData;

}













