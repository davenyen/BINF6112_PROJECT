const xlsxFile = require('read-excel-file/node');

var parsedData;


xlsxFile('./ige.xlsx').then((rows) => {
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
    let cleaner = 0;
    for(let i=0;i<rows.length;i++){
        if(typeof MicroArrData[i].peptideSeq === 'undefined'){
            cleaner++;
        }
    }
    for(let i=0;i<cleaner;i++){
        MicroArrData.pop();
    }

    console.log(MicroArrData)  

})



