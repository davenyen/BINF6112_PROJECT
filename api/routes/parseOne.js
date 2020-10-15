

// setup export

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
 })