let config = require('./Config.json')
const xlsxFile = require('read-excel-file/node');

var start = exports.parse = async function parseData(file_path){
    MicroArrData = new Array();
    let file_type = ""
    if(file_path.match(/\.gpr$/)){
        file_type = "gpr"
        var XLSX = require('xlsx')
        var workbook = XLSX.readFile(file_path);
        var sheet_name_list = workbook.SheetNames;
        var ws = workbook.Sheets[sheet_name_list[0]]
        var range = XLSX.utils.decode_range(ws['!ref']);
        range.s.r = config.gpr.rowsToSkip; // skip header rows
        ws['!ref'] = XLSX.utils.encode_range(range);
        XLSX.utils.sheet_to_json(ws)
        var xlData = XLSX.utils.sheet_to_json(ws);
        xlData.forEach(data => {
            MicroArrData.push({ 
                peptideSeq: data[JSON.parse(JSON.stringify(config.gpr.sequence))],
                proteinId:data[JSON.parse(JSON.stringify(config.gpr.name))] || "",
                rawMean:data[JSON.parse(JSON.stringify(config.gpr.rawMean))],
                backgroundMean:data[JSON.parse(JSON.stringify(config.gpr.backgroundMean))],
                foregroundMedian:data[JSON.parse(JSON.stringify(config.gpr.foregroundMedian))],
                snr:data[JSON.parse(JSON.stringify(config.gpr.snr))]
            })
        })
    }else{
        file_type = "xl"
        const rows = await xlsxFile(file_path);
        for(let i = 0; i < rows.length; i++){
            MicroArrData.push({  
                peptideSeq: undefined,
                proteinId:undefined,
                rawMean:undefined,
                backgroundMean:undefined,
                foregroundMedian:undefined,
                snr: NaN
            })
        }
        for(i in rows){
            for(j in rows[i]){
                if(rows[i][j]!=null){
                    if(String(rows[i][j]).match(new RegExp(JSON.parse(JSON.stringify(config.excel.sequence)),'ig'))){
                        let iter = 0;
                        for(let row=Number(i)+1;row<rows.length; row++){
                            MicroArrData[iter].peptideSeq = rows[row][j]
                            iter++;
                        }
                    }else if(String(rows[i][j]).match(new RegExp(JSON.parse(JSON.stringify(config.excel.name)),'ig'))){
                        let iter=0;
                        for(let row=Number(i)+1;row<rows.length; row++){
                            MicroArrData[iter].proteinId = rows[row][j]
                            iter++;
                        }
                    }else if(String(rows[i][j]).match(new RegExp(JSON.parse(JSON.stringify(config.excel.rawMean)),'ig'))){
                        let iter=0;
                        for(let row=Number(i)+1;row<rows.length; row++){
                            MicroArrData[iter].rawMean = rows[row][j]
                            iter++;
                        }
                    }else if(String(rows[i][j]).match(new RegExp(JSON.parse(JSON.stringify(config.excel.backgroundMean)),'ig'))){
                        let iter=0;
                        for(let row=Number(i)+1;row<rows.length; row++){
                            MicroArrData[iter].backgroundMean = rows[row][j]
                            iter++;
                        }
                    }else if(String(rows[i][j]).match(new RegExp(JSON.parse(JSON.stringify(config.excel.foregroundMedian)),'ig'))){
                        let iter=0;
                        for(let row=Number(i)+1;row<rows.length; row++){
                            MicroArrData[iter].foregroundMedian = rows[row][j]
                            iter++;
                        }
                    }else if(String(rows[i][j]).match(new RegExp(JSON.parse(JSON.stringify(config.excel.snr)),'ig'))){
                        let iter=0;
                        for(let row=Number(i)+1;row<rows.length; row++){
                            MicroArrData[iter].snr = rows[row][j]
                            iter++;
                        }
                    }
                }
            }
        }
    }
    

    //UnAveraged data in cleanedMad
    const cleanedMad = MicroArrData.filter(data => data.peptideSeq != undefined)
    //console.log(cleanedMad)
    //Averaging starts here
    const duplicatesort = cleanedMad.reduce((r, a) => {
        r[a.peptideSeq] = r[a.peptideSeq] || [];
        r[a.peptideSeq].push(a);
        return r;
    }, Object.create({}));
    //console.log(duplicatesort)
    //Variable holding final Averaged data
    const tripleAveragedData = [];

    Object.keys(duplicatesort).forEach(key =>{
        let ps = ""; let pi = "";let rm =0;let bm=0; let fm=0; let sr=0; let srfl=0; 
        duplicatesort[key].forEach(data =>{
            rm += data.rawMean;
            bm += data.backgroundMean;
            fm += data.foregroundMedian;
            ps = data.peptideSeq;
            pi = data.proteinId;

            if(data.snr !== undefined && (!isNaN(data.snr) && (data.snr != null))){
                if(srfl == 0){sr += data.snr}
            }else{sr=NaN;srfl=1;}

        })
        rm = rm/duplicatesort[key].length;
        bm = bm/duplicatesort[key].length;
        fm = fm/duplicatesort[key].length;
        if(srfl!=1){sr = sr/duplicatesort[key].length;}
        tripleAveragedData.push({
            peptideSeq: ps,
            proteinId: pi,
            data: [ {
                file: file_path,
                rawMean: rm,
                backgroundMean: bm,
                foregroundMedian: fm,
                snr:sr 
            } ]
        })


    })
    //console.log(tripleAveragedData)
    return tripleAveragedData;
}


//start("./ige.gpr") -> for debugging purposes



exports.parseMultiple = async function parse_multiple(file_paths) { 
    
    // let json1 = await this.parse(file_paths[0]);
    // let json2 = await this.parse(file_paths[1]);

    let m = new Map();

    for (let file of file_paths) {
        let json = await this.parse(file);
//the gpr files dont have Id (as in name) so I changed your proteinId to  peptideSequece
        json.forEach(function(pepA) {
            if (m.has(pepA.peptideSeq)) {
                let pep = m.get(pepA.peptideSeq);
                let data = pep.data;
                data.push(pepA.data[0]);
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
                // pep = {
                //     peptideSeq: pepA.peptideSeq,
                //     proteinId: pepA.proteinId,
                //     data: [{
                //         file: file_paths[0],
                //         rawMean: pepA.rawMean,
                //         backgroundMean: pepA.backgroundMean,
                //         foregroundMedian: pepA.foregroundMedian
                //     }]
                // }
                m.set(pepA.peptideSeq, pepA);
            }
        });
    }

    return Array.from(m.values());
}







