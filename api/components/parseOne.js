// Update 


const xlsxFile = require('read-excel-file/node');
const fileHandler = '../public/ige.xlsx';

const parseMethod = (
xlsxFile(fileHandler).then((rows) => {
    parsedObject = {
        peptideSeq:[],
        proteinId:[],
        rawMean:[],
        backgroundMean:[],
        foregroundMedian:[]
    }
    parsedData = parsedObject;

    for(i in rows){
        for(j in rows[i]){
            if(rows[i][j]!=null){
                if(String(rows[i][j]) == "Peptide"){
                    for(let row=Number(i)+1;row<rows.length; row++){
                       parsedObject.peptideSeq.push(rows[row][j]);
                    }
                }else if(String(rows[i][j]) == "Antigen/Protein ID"){
                    for(let row=Number(i)+1;row<rows.length; row++){
                        parsedObject.proteinId.push(rows[row][j]);
                     }
                }else if(String(rows[i][j]).match(/Raw Mean/g)){
                    for(let row=Number(i)+1;row<rows.length; row++){
                        parsedObject.rawMean.push(rows[row][j]);
                     }
                }else if(String(rows[i][j]).match(/Background Mean/g)){
                    for(let row=Number(i)+1;row<rows.length; row++){
                        parsedObject.backgroundMean.push(rows[row][j]);
                     }
                }else if(String(rows[i][j]).match(/Foreground Median/g)){
                    for(let row=Number(i)+1;row<rows.length; row++){
                        parsedObject.foregroundMedian.push(rows[row][j]);
                     }
                }
            }
        }
    }
    console.log(parsedObject);
}))

exports.parseMethod = parseMethod;


//commented version of multiple parse from V2
/*var starm = exports.parseMultiple = async function parse_multiple(file_paths) { 
    
    // let json1 = await this.parse(file_paths[0]);
    // let json2 = await this.parse(file_paths[1]);
    
    console.log(this,"ARAPRA2312")
    let m = new Map();

    for (let file of file_paths) {
        //let json = await this.parse(file);
        let json = await start(file)
//the gpr files dont have Id (as in name) so I changed your proteinId to  peptideSequece
        json.forEach(function(pepA) {
            if (m.has(pepA.peptideSeq)) {
                //let pep = m.get(pepA.peptideSeq);
                //let data = pep.data;
                //data.push(pepA.data[0]);
                m.get(pepA.peptideSeq).data.push(pepA.data[0])
                //------------------------------------------
                //console.log(pep);
                // console.log(data);
                // pep.data.push({
                //     file: file_paths[1],
                //     rawMean: pepA.rawMean,
                //     backgroundMean: pepA.backgroundMean,
                //     foregroundMedian: pepA.foregroundMedian
                // });
                // console.log(pep.data);
                
                // m.set(pepA.proteinId, data);
            } else {
                m.set(pepA.peptideSeq, pepA);
            }
        });
    }
    //console.log(Array.from(m.values()))
    return Array.from(m.values());
}*/